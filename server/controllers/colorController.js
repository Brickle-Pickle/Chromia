import Color from "../models/Color.js";
import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const createColor = async (req, res) => {
    try {
        const { name, color } = req.body;
        
        // Validate input
        if (!name || !color) {
            return res.status(400).json({ message: 'Name and color are required' });
        }
        
        // Validate hex color format
        const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!hexColorRegex.test(color)) {
            return res.status(400).json({ message: 'Invalid hex color format' });
        }
        
        const colorInstance = new Color({
            name,
            color,
            author: req.user._id
        });
        
        await colorInstance.save();
        res.status(201).json(colorInstance);
    } catch (error) {
        console.error('Error creating color:', error);
        res.status(400).json({ message: error.message });
    }
};

const getColors = async (req, res) => {
    try {
        const colors = await Color.find({ author: req.user._id });
        res.status(200).json(colors);
    } catch (error) {
        console.error('Error getting colors:', error);
        res.status(400).json({ message: error.message });
    }
};

// Get all community colors (public endpoint)
const getAllCommunityColors = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        
        // Build search query
        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { color: { $regex: search, $options: 'i' } }
                ]
            };
        }
        
        const colors = await Color.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'userName');
            
        const total = await Color.countDocuments(query);
        const hasMore = skip + colors.length < total;
        
        res.status(200).json({
            colors,
            pagination: {
                page,
                limit,
                total,
                hasMore,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error getting community colors:', error);
        res.status(400).json({ message: error.message });
    }
};

const colorCount = async (req, res) => {
    try {
        const count = await Color.countDocuments();
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error counting colors:', error);
        res.status(400).json({ message: error.message });
    }
};

const router = express.Router();

// Public routes (no authentication required)
router.get('/community', getAllCommunityColors);
router.get('/count', colorCount);

// Protected routes (authentication required)
router.post('/create', authenticateToken, createColor);
router.get('/', authenticateToken, getColors);

export default router;