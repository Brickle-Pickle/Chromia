import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// JWT Secret key - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Main authentication middleware
export const authenticateToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                error: 'Access token required',
                message: 'No token provided in Authorization header'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Find user in database
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid token',
                message: 'User not found'
            });
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Invalid token',
                message: 'Token is malformed'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expired',
                message: 'Please login again'
            });
        }

        // Generic server error
        return res.status(500).json({ 
            error: 'Server error',
            message: 'Authentication failed'
        });
    }
};

// Optional authentication middleware - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        req.user = user || null;
        next();

    } catch (error) {
        // If token is invalid, just continue without user
        req.user = null;
        next();
    }
};

// Generate JWT token for user
export const generateToken = (userId) => {
    return jwt.sign(
        { userId: userId },
        JWT_SECRET,
        { expiresIn: '24h' } // Token expires in 24 hours
    );
};

// Middleware to check if user is authenticated (alias for authenticateToken)
export const requireAuth = authenticateToken;

// Middleware to verify token and get user info without failing
export const verifyTokenSilent = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password');
            req.user = user;
        }
    } catch (error) {
        // Silently fail - don't set req.user
    }
    
    next();
};

export default {
    authenticateToken,
    optionalAuth,
    generateToken,
    requireAuth,
    verifyTokenSilent
};