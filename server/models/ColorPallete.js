import mongoose from "mongoose";

// Define color subdocument schema
const ColorSubSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
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
    }
}, { _id: false }); // Disable _id for subdocuments

const ColorPalleteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    colors: {
        type: [ColorSubSchema],
        required: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0 && v.length <= 20; // Max 20 colors per palette
            },
            message: 'Palette must have between 1 and 20 colors'
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
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
ColorPalleteSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Only populate author field when finding multiple documents (for display purposes)
// Remove automatic populate to avoid issues with authorization checks
ColorPalleteSchema.pre(['find'], function() {
    this.populate('author', 'userName');
});

export default mongoose.model('ColorPallete', ColorPalleteSchema);