import mongoose from 'mongoose';
import slugify from 'slugify';

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
  }],
  currentlyReading: [{
    type: Schema.Types.ObjectId,
    ref: 'Book'
  }],
  wantToRead: [{
    type: Schema.Types.ObjectId,
    ref: 'Book'
  }],
  read: [{
    type: Schema.Types.ObjectId,
    ref: 'Book'
  }],
  // Define the books field for populating
  books: [{
    type: Schema.Types.ObjectId,
    ref: 'Book'
  }],
  preferredGenres: [{
    type: String // Store genre names
  }],
  isFirstTimeLogin: {
    type: Boolean,
    default: true
  }
});

userSchema.methods.addToCurrentlyReading = function(bookId) {
  // Remove from other lists if exists
  this.wantToRead = this.wantToRead.filter(id => id.toString() !== bookId.toString());
  this.read = this.read.filter(id => id.toString() !== bookId.toString());

  // Add to currentlyReading if not already present
  if (!this.currentlyReading.includes(bookId)) {
    this.currentlyReading.push(bookId);
  }
};

userSchema.methods.addToWantToRead = function(bookId) {
  // Remove from other lists if exists
  this.currentlyReading = this.currentlyReading.filter(id => id.toString() !== bookId.toString());
  this.read = this.read.filter(id => id.toString() !== bookId.toString());

  // Add to wantToRead if not already present
  if (!this.wantToRead.includes(bookId)) {
    this.wantToRead.push(bookId);
  }
};

userSchema.methods.addToRead = function(bookId) {
  // Remove from other lists if exists
  this.currentlyReading = this.currentlyReading.filter(id => id.toString() !== bookId.toString());
  this.wantToRead = this.wantToRead.filter(id => id.toString() !== bookId.toString());

  // Add to read if not already present
  if (!this.read.includes(bookId)) {
    this.read.push(bookId);
  }
};

userSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    this.lastLogin = new Date();
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
