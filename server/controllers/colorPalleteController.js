import express from "express";
import ColorPallete from "../models/ColorPallete.js";

const createColorPallete = async (req, res) => {
    try {
        const { name, colors } = req.body;
        
        // Validate input
        if (!name || !colors || colors.length === 0) {
            return res.status(400).json({ message: 'Name and colors are required' });
        }
        
        // Validate colors array
        if (colors.some(color => !color.name || !color.color)) {
            return res.status(400).json({ message: 'Invalid color format' });
        }

        // Validate color hex format
        const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (colors.some(color => !hexColorRegex.test(color.color))) {
            return res.status(400).json({ message: 'Invalid hex color format' });
        }

        const author = req.user._id;

        // Create ColorPallete instance with embedded colors
        const colorPallete = new ColorPallete({
            name,
            colors: colors.map(color => ({
                name: color.name,
                color: color.color
            })),
            author,
        });

        await colorPallete.save();
        res.status(201).json(colorPallete);
    } catch (error) {
        console.error('Error creating color palette:', error);
        res.status(400).json({ message: error.message });
    }
};

const getColorPalletes = async (req, res) => {
    try {
        const colorPalletes = await ColorPallete.find({ author: req.user._id });
        res.status(200).json(colorPalletes);
    } catch (error) {
        console.error('Error getting color palettes:', error);
        res.status(400).json({ message: error.message });
    }
};

const getColorPallete = async (req, res) => {
    try {
        // Use findById without populate to get raw ObjectId for authorization check
        const colorPallete = await ColorPallete.findById(req.params.id).populate('author', 'userName');
        
        if (!colorPallete) {
            return res.status(404).json({ message: 'Color palette not found' });
        }
        
        // Check if user owns this palette - handle both ObjectId and populated object
        const authorId = colorPallete.author._id || colorPallete.author;
        if (authorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        res.status(200).json(colorPallete);
    } catch (error) {
        console.error('Error getting color palette:', error);
        res.status(400).json({ message: error.message });
    }
};

const deleteColorPallete = async (req, res) => {
    try {
        // First check authorization without populate to avoid issues
        const paletteForAuth = await ColorPallete.findById(req.params.id).select('author');
        
        if (!paletteForAuth) {
            return res.status(404).json({ message: 'Color palette not found' });
        }
        
        // Check if user owns this palette - author is guaranteed to be ObjectId here
        if (paletteForAuth.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        // If authorized, proceed with deletion
        await ColorPallete.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Color palette deleted successfully' });
    } catch (error) {
        console.error('Error deleting color palette:', error);
        res.status(400).json({ message: error.message });
    }
};

const updateColorPallete = async (req, res) => {
    try {
        const { name, colors } = req.body;
        
        // Validate input
        if (!name || !colors || colors.length === 0) {
            return res.status(400).json({ message: 'Name and colors are required' });
        }
        
        // Validate colors array
        if (colors.some(color => !color.name || !color.color)) {
            return res.status(400).json({ message: 'Invalid color format' });
        }

        // Validate color hex format
        const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (colors.some(color => !hexColorRegex.test(color.color))) {
            return res.status(400).json({ message: 'Invalid hex color format' });
        }
        
        // First check authorization without populate
        const paletteForAuth = await ColorPallete.findById(req.params.id).select('author');
        
        if (!paletteForAuth) {
            return res.status(404).json({ message: 'Color palette not found' });
        }
        
        // Check if user owns this palette - author is guaranteed to be ObjectId here
        if (paletteForAuth.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        // If authorized, proceed with update
        const updatedPalette = await ColorPallete.findByIdAndUpdate(
            req.params.id, 
            {
                name,
                colors: colors.map(color => ({
                    name: color.name,
                    color: color.color
                })),
                updatedAt: Date.now()
            }, 
            {
                new: true,
                runValidators: true
            }
        );
        
        res.status(200).json(updatedPalette);
    } catch (error) {
        console.error('Error updating color palette:', error);
        res.status(400).json({ message: error.message });
    }
};

const router = express.Router();

router.post('/create', createColorPallete);
router.get('/', getColorPalletes);
router.get('/:id', getColorPallete);
router.delete('/:id', deleteColorPallete);
router.put('/:id', updateColorPallete);

export default router;