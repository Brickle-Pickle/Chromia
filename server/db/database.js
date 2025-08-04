import mongoose from 'mongoose';

// Database configuration
const DB_CONFIG = {
    // MongoDB connection string from environment or default local
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/chromia',
    
    // Connection options for better performance and reliability
    OPTIONS: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Maximum number of connections in the pool
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferMaxEntries: 0, // Disable mongoose buffering
        bufferCommands: false, // Disable mongoose buffering
    }
};

// Database connection state
let isConnected = false;

// Connect to MongoDB
export const connectDB = async () => {
    // Prevent multiple connections
    if (isConnected) {
        console.log('Database already connected');
        return;
    }

    try {
        console.log('Connecting to MongoDB...');
        
        // Connect to MongoDB
        const connection = await mongoose.connect(DB_CONFIG.MONGODB_URI, DB_CONFIG.OPTIONS);
        
        isConnected = true;
        console.log(`MongoDB connected successfully: ${connection.connection.host}`);
        
        return connection;
        
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        
        // Exit process with failure if in production
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
        
        throw error;
    }
};

// Disconnect from MongoDB
export const disconnectDB = async () => {
    try {
        if (isConnected) {
            await mongoose.disconnect();
            isConnected = false;
            console.log('MongoDB disconnected successfully');
        }
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error.message);
        throw error;
    }
};

// Get connection status
export const getConnectionStatus = () => {
    return {
        isConnected,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name
    };
};

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
    isConnected = true;
});

mongoose.connection.on('error', (error) => {
    console.error('Mongoose connection error:', error);
    isConnected = false;
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
    isConnected = false;
});

// Handle application termination
process.on('SIGINT', async () => {
    try {
        await disconnectDB();
        console.log('Application terminated gracefully');
        process.exit(0);
    } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
    }
});

// Export default connection function
export default connectDB;