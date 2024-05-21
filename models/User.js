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
  },
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
});

userSchema.methods.addToCurrentlyReading = function(bookId) {
  this.wantToRead = this.wantToRead.filter(id => id.toString() !== bookId.toString());
  this.read = this.read.filter(id => id.toString() !== bookId.toString());

  if (!this.currentlyReading.includes(bookId)) {
    this.currentlyReading.push(bookId);
  }
};

userSchema.methods.addToWantToRead = function(bookId) {
  this.currentlyReading = this.currentlyReading.filter(id => id.toString() !== bookId.toString());
  this.read = this.read.filter(id => id.toString() !== bookId.toString());

  if (!this.wantToRead.includes(bookId)) {
    this.wantToRead.push(bookId);
  }
};

userSchema.methods.addToRead = function(bookId) {
  this.currentlyReading = this.currentlyReading.filter(id => id.toString() !== bookId.toString());
  this.wantToRead = this.wantToRead.filter(id => id.toString() !== bookId.toString());

  if (!this.read.includes(bookId)) {
    this.read.push(bookId);
  }
};

userSchema.methods.follow = function(userId) {
  if (!this.following.includes(userId)) {
    this.following.push(userId);
  }
};

userSchema.methods.unfollow = function(userId) {
  this.following = this.following.filter(id => id.toString() !== userId.toString());
};

userSchema.methods.addFollower = function(userId) {
  if (!this.followers.includes(userId)) {
    this.followers.push(userId);
  }
};

userSchema.methods.removeFollower = function(userId) {
  this.followers = this.followers.filter(id => id.toString() !== userId.toString());
};

userSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    this.lastLogin = new Date();
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
