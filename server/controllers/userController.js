import User from "../models/User.js";
import jwt from "jsonwebtoken";
import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        
        const existingUser = await User.findOne({ userName: username }); // Fixed field name
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        
        const user = new User({ userName: username, password }); // Fixed field name, password will be hashed by pre-save middleware
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(400).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        
        const user = await User.findOne({ userName: username }); // Fixed field name
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        
        const isPasswordValid = await user.comparePassword(password); // Use model method
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '24h',
        });
        res.status(200).json({ 
            token,
            user: {
                id: user._id,
                username: user.userName
            }
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(400).json({ message: error.message });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password'); // Fixed to use req.user._id
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error getting current user:', error);
        res.status(400).json({ message: error.message });
    }
};

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/current', authenticateToken, getCurrentUser);

export default router;