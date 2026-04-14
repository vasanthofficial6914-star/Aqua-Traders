import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import connectDB from './config/db.js';

// Route files
import authRoutes from './routes/authRoutes.js';
import fishRoutes from './routes/fishRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import netDataRoutes from './routes/netDataRoutes.js';
import hardwareRoutes from './routes/hardwareRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import { loginUser } from './controllers/authController.js';


// Connect to DB
connectDB();


const app = express();
const httpServer = createServer(app);

// WebSocket Server for real-time hardware telemetry
const wss = new WebSocketServer({ server: httpServer, path: '/hardware' });

// Make wss accessible to express routes
app.set('wss', wss);

wss.on('connection', (ws) => {
    console.log('📱 New WebSocket client connected to cloud');
    ws.on('close', () => console.log('🔌 Client disconnected from cloud'));
});

// Middleware
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://fisher-man.vercel.app",
        "https://fisher-m53n2maga-haswin-singhs-projects.vercel.app",
        "http://127.0.0.1:5173"
    ],
    credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);

// Helper for Login response
app.post('/api/login', async (req, res) => {
    try {
        console.log('Login request received for:', req.body.email);
        // We reuse the controller logic or call it directly
        await loginUser(req, res);
    } catch (err) {
        console.error('Login Route Error:', err);
        res.status(500).json({ success: false, message: 'Server Internal Error' });
    }
});

app.use('/api/fish', fishRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/netdata', netDataRoutes);
app.use('/api/hardware', hardwareRoutes);
app.use('/api/services', serviceRoutes);

// Simple ping endpoint for connection checks
app.get('/api/ping', (req, res) => {
    res.json({ success: true, message: 'FisherDirect Backend Active', timestamp: new Date() });
});

// 404 Handler for API routes (Return JSON instead of HTML)
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: `API Route Not Found: ${req.originalUrl}` });
});


// Error Handling Middleware for Unmatched Routes
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

