import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Import controllers
import colorController from "./controllers/colorController.js";
import colorPalleteController from "./controllers/colorPalleteController.js";
import userController from "./controllers/userController.js";

// Import middleware
import { authenticateToken } from "./middlewares/authMiddleware.js";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const dbUrl = process.env.MONGODB_URI || process.env.DB_URL;

// CORS configuration - updated for production
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:5173', // Development
            'https://your-app-name.vercel.app', // Production - update this with your actual Vercel URL
            /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/, // Local network IPs
            /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:5173$/, 
            /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}:5173$/
        ];
        
        const isAllowed = allowedOrigins.some(pattern => {
            if (typeof pattern === 'string') {
                return pattern === origin;
            }
            return pattern.test(origin);
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware configuration
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(dbUrl);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Basic routes
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Chromia API Server',
        version: '1.0.0',
        status: 'Running'
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes - Register the controllers
app.use('/api/users', userController);
app.use('/api/colors', colorController); // This includes the public /community route
app.use('/api/palettes', authenticateToken, colorPalleteController);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Something went wrong!'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});

// Start server - bind to all interfaces
const startServer = async () => {
    try {
        await connectDB();
        app.listen(port, '0.0.0.0', () => { // Bind to all interfaces
            console.log(`Server running on port ${port}`);
            console.log(`Health check: http://localhost:${port}/health`);
            console.log(`Network access: http://0.0.0.0:${port}/health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down server...');
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
});

// Start the server
startServer();