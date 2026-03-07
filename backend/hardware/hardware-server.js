import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// CONFIGURATION
const SERIAL_PORT_PATH = process.env.SERIAL_PORT || 'COM23';
const BAUD_RATE = parseInt(process.env.BAUD_RATE || '9600');
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api/hardware/update';
const WS_PORT = parseInt(process.env.HARDWARE_PORT || '5001');

let wss = null;
let heartbeatInterval = null;

console.log(`\n=========================================`);
console.log(`  FISHERMAN HARDWARE BRIDGE`);
console.log(`  PROCESS ID: ${process.pid}`);
console.log(`=========================================\n`);

/**
 * START WEBSOCKET SERVER WITH AUTO-PORT HUNTING
 */
function startWebSocketServer(port) {
    try {
        const server = new WebSocketServer({ port, path: '/hardware' }, () => {
            console.log(`✅ Hardware WebSocket Server running at: ws://localhost:${port}/hardware`);
            wss = server;
            setupServerEventHandlers();
            startHeartbeat();
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.warn(`⚠️  Port ${port} is busy, trying ${port + 1}...`);
                server.close();
                startWebSocketServer(port + 1);
            } else {
                console.error('❌ WebSocket server error:', err.message);
            }
        });
    } catch (err) {
        console.error('❌ Failed to initialize WebSocket server:', err.message);
    }
}

function setupServerEventHandlers() {
    wss.on('connection', (ws) => {
        ws.isAlive = true;
        ws.on('pong', () => { ws.isAlive = true; });
        console.log(`📡 Client connected (Total: ${wss.clients.size})`);

        ws.on('close', () => {
            console.log('🔌 Client disconnected');
        });

        ws.on('error', (err) => {
            console.error('❌ WebSocket client error:', err.message);
        });
    });
}

function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
        if (!wss) return;
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);
}

// Initialize server
startWebSocketServer(WS_PORT);

/**
 * Broadcasts data to all connected clients
 */
function broadcast(data) {
    if (!wss) return;
    const payload = JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client.readyState === 1) { // 1 = OPEN
            client.send(payload);
        }
    });
}

/**
 * Pushes data to the central backend API
 */
async function pushToBackend(data) {
    try {
        await fetch(BACKEND_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    } catch (error) {
        // API offline is non-critical
    }
}

// Bluetooth Serial Integration
const port = new SerialPort({
    path: "COM23",
    baudRate: 9600
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

parser.on("data", (line) => {
    console.log("Serial Data:", line);

    // Convert incoming data to JSON
    // Example Arduino output: Weight: 0.25
    if (line.includes("Weight:")) {
        const weightValue = parseFloat(line.replace("Weight:", "").trim());

        if (!isNaN(weightValue)) {
            const sensorData = {
                weight: weightValue,
                timestamp: Date.now()
            };

            console.log(`Hardware Data Received: {weight: ${weightValue}}`);

            // Broadcast the data to all WebSocket clients
            const payload = JSON.stringify(sensorData);
            wss.clients.forEach(client => {
                if (client.readyState === 1) { // 1 = OPEN
                    client.send(payload);
                }
            });

            // Optional: Push to backend
            pushToBackend(sensorData);
        }
    }
});

port.on('open', () => {
    console.log(`🚀 SUCCESS: Receiving data from COM23`);
});

port.on('close', () => {
    console.log('📢 Hardware disconnected.');
});

port.on('error', (err) => {
    console.error('❌ Communication error:', err.message);
});

// Graceful Shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down bridge...');
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (wss) wss.close();
    if (port && port.isOpen) port.close();
    process.exit(0);
});


