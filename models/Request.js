import mongoose from 'mongoose';

const { Schema } = mongoose;

const requestSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the user who made the request
    required: true
  },
  requestDetails: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Request = mongoose.model('Request', requestSchema);

export default Request;
