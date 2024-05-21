import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const memberSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'member'], default: 'member' }
});

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Group admin
    members: [memberSchema], // Array of subdocuments for members
    messages: [messageSchema], // Array of subdocuments for messages
    createdAt: { type: Date, default: Date.now }
});

const Room = mongoose.model('Room', roomSchema);
export default Room;
