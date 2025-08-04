import mongoose from "mongoose";

const ColorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    colors: {
        type: Array,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

ColorSchema.pre('save', async function (next) {
    if (this.isNew) {
        const existingColor = await this.constructor.findOne({ name: this.name });
        if (existingColor) {
            throw new Error('A color with this name already exists');
        }
    }
    next();
});

// Populate author field
ColorSchema.post('save', function (doc, next) {
    doc.author = doc.author.toJSON();
    next();
});

export default mongoose.model('Color', ColorSchema);