import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userroutes from './routes/userroutes.js';
import authroutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import listingRouter from './routes/listing.routes.js'; 

dotenv.config();
console.log('Environment variables loaded:', {
  MONGODB: process.env.MONGODB,
  JWT_SECRET: process.env.JWT_SECRET
});

mongoose.connect(process.env.MONGODB || 'mongodb://localhost:27017/real_estate').then(() => {
    console.log('Connected to MongoDB');
  }).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

const app = express();

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/user', userroutes);
app.use('/auth', authroutes);
app.use('/listing', listingRouter);

// middleware for handling errors
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    console.error(`Error handling ${req.method} ${req.path}:`, err);
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});