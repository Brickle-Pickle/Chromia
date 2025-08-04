import Color from "../models/Color.js";
import express from "express";

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

const router = express.Router();

router.post('/create', createColor);
router.get('/', getColors);

export default router;