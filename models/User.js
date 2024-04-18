import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  dateOfJoined: {
    type: Date,
    default: Date.now
  },
 
  sentMessages: [{
    type: Schema.Types.ObjectId,
    ref: 'Message'
  }],

  receivedMessages: [{
    type: Schema.Types.ObjectId,
    ref: 'Message'
  }]
});


userSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    this.lastLogin = new Date();
  }
  next();
});

const User = mongoose.model('User', userSchema);

export { User };
