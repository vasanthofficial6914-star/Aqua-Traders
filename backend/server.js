import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

// Route files
import authRoutes from './routes/authRoutes.js';
import fishRoutes from './routes/fishRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import netDataRoutes from './routes/netDataRoutes.js';
import hardwareRoutes from './routes/hardwareRoutes.js';

// Connect to DB
connectDB();

const app = express();

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

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
