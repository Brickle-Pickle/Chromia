import mongoose from "mongoose";

const ColorPalleteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    colors: {
        type: [ColorSchema],
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

// Populate author field
ColorPalleteSchema.post('save', function (doc, next) {
    doc.author = doc.author.toJSON();
    next();
});

export default mongoose.model('ColorPallete', ColorPalleteSchema);