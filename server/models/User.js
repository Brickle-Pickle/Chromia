import mongoose from 'mongoose'
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});

// Middleware para el hashing de la contraseña
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Middleware para la verificación de la contraseña
UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};


export default mongoose.model('User', UserSchema);