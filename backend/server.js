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
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/fish', fishRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/netdata', netDataRoutes);
app.use('/api/hardware', hardwareRoutes);
app.use('/api/services', serviceRoutes);


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

