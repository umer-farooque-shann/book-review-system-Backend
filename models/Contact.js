import mongoose from 'mongoose';

const { Schema } = mongoose;

const contactSchema = new Schema({
  fullName: {
    type: String,
    required: true
  },
  company: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String
  },
  address: {
    type: String
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
