import mongoose from "mongoose";

const ColorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    color: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                // Validate hex color format
                return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
            },
            message: 'Color must be a valid hex color code'
        }
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Populate author field when finding
ColorSchema.pre(['find', 'findOne'], function() {
    this.populate('author', 'username');
});

export default mongoose.model('Color', ColorSchema);