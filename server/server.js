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

// Middleware configuration
app.use(cors());
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
app.use('/api/colors', authenticateToken, colorController);
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

// Start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
            console.log(`Health check: http://localhost:${port}/health`);
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