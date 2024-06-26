import mongoose from 'mongoose';

const { Schema } = mongoose;

const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


const Message = mongoose.model('Message', messageSchema);

export default Message;
