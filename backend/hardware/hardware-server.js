import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { WebSocketServer } from 'ws';

// CONFIGURATION
const SERIAL_PORT_PATH = 'COM23';
const BAUD_RATE = 9600;
const WS_PORT = 5001;
const BACKEND_API_URL = 'http://localhost:5000/api/hardware/update';

console.log(`\n=========================================`);
console.log(`  FISHERMAN HARDWARE BRIDGE (PORT ${WS_PORT})`);
console.log(`=========================================\n`);

// Initialize WebSocket Server with path /hardware
const wss = new WebSocketServer({ port: WS_PORT, path: '/hardware' });
console.log(`Hardware WebSocket Server Running on port ${WS_PORT} at /hardware`);

// Heartbeat System
function heartbeat() {
    this.isAlive = true;
}

const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', heartbeat);

    console.log('Client Connected (Total: ' + wss.clients.size + ')');

    ws.on('close', () => {
        console.log('Client Disconnected');
    });

    ws.on('error', (err) => {
        console.error('WebSocket Client Error:', err.message);
    });
});

wss.on('close', () => {
    clearInterval(interval);
});

/**
 * Broadcasts structured JSON to all connected clients.
 */
function broadcast(data) {
    const payload = JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client.readyState === 1) { // 1 is OPEN
            client.send(payload);
        }
    });
    // Log weight specific broadcasting as requested
    if (data.weight !== undefined) {
        console.log(`Broadcasting weight data: ${data.weight}kg`);
    } else {
        console.log('Broadcasting metadata');
    }
}

/**
 * Pushes data to the central backend API using native fetch
 */
async function pushToBackend(data) {
    try {
        const response = await fetch(BACKEND_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (response.ok) {
            // console.log('Data pushed to backend API');
        }
    } catch (error) {
        // console.error('Error pushing to backend:', error.message);
    }
}

// Serial Port Logic
let port;

function connectSerial() {
    console.log(`Attempting to open Serial Port: ${SERIAL_PORT_PATH}...`);

    port = new SerialPort({
        path: SERIAL_PORT_PATH,
        baudRate: BAUD_RATE,
        autoOpen: false
    });

    const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

    port.open((err) => {
        if (err) {
            console.error(`Serial Error: ${err.message}`);
            console.log('Retrying in 5 seconds...');
            setTimeout(connectSerial, 5000);
            return;
        }
        console.log(`SUCCESS: Connected to serial port ${SERIAL_PORT_PATH}`);
    });

    parser.on('data', (data) => {
        const cleanData = data.toString().trim();
        if (cleanData) {
            // console.log(`[SERIAL] ${cleanData}`);

            let sensorData = {
                weight: 0,
                temperature: 0,
                salinity: 0,
                timestamp: Date.now()
            };

            // Enhanced Parsing logic
            if (cleanData.toLowerCase().includes('weight:')) {
                const val = parseFloat(cleanData.split(':')[1].trim());
                if (!isNaN(val)) sensorData.weight = val;
            } else if (cleanData.includes('W:') || cleanData.includes('T:')) {
                // Parse "W:4.2,T:29,S:31"
                const parts = cleanData.split(',');
                parts.forEach(part => {
                    const pair = part.split(':');
                    if (pair.length === 2) {
                        const key = pair[0].trim().toLowerCase();
                        const val = parseFloat(pair[1].trim());
                        if (key === 'w' || key.includes('weight')) sensorData.weight = val;
                        if (key === 't' || key.includes('temp')) sensorData.temperature = val;
                        if (key === 's' || key.includes('sal')) sensorData.salinity = val;
                    }
                });
            } else {
                // Fallback raw number
                const val = parseFloat(cleanData);
                if (!isNaN(val)) sensorData.weight = val;
            }

            // Only broadcast if we have meaningful data
            if (sensorData.weight !== 0 || sensorData.temperature !== 0 || sensorData.salinity !== 0) {
                // Also add a "type" field for the useHardwareWeight hook if it filters by type
                const weightPacket = {
                    type: "weight",
                    value: sensorData.weight,
                    ...sensorData
                };
                broadcast(weightPacket);
                pushToBackend(sensorData);
            }
        }
    });

    port.on('close', () => {
        console.log('Serial port closed. Reconnecting...');
        setTimeout(connectSerial, 5000);
    });

    port.on('error', (err) => {
        console.error('Serial port error:', err.message);
    });
}

// Start connection
connectSerial();

// Helper to list ports
async function listPorts() {
    try {
        const ports = await SerialPort.list();
        if (ports.length === 0) {
            console.log('No serial ports found.');
            return;
        }
        console.log('Available Serial Ports:');
        ports.forEach(p => console.log(`  - ${p.path} (${p.friendlyName || 'Device'})`));
    } catch (err) {
        console.error('Error listing ports:', err);
    }
} listPorts();
