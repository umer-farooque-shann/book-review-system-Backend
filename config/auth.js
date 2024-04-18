import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as AppleStrategy } from 'passport-apple';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User.js';



export const generateAccessToken = (user) => {
    return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (user) => {
    return jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
};

export const verifyRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
      jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded.userId);
      });
    });
  };



passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/facebook/callback"
}, (accessToken, refreshToken, profile, done) => {
  
}));


passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: "http://localhost:5000/auth/twitter/callback"
}, (token, tokenSecret, profile, done) => {
  
}));


passport.use(new AppleStrategy({
  clientID: process.env.APPLE_CLIENT_ID,
  teamID: process.env.APPLE_TEAM_ID,
  callbackURL: "http://localhost:5000/auth/apple/callback",
  keyID: process.env.APPLE_KEY_ID,
  privateKeyLocation: 'path/to/apple/private/key.pem'
}, (accessToken, refreshToken, profile, done) => {
  // Implement user registration or login with Apple profile data
}));

// Configure Google strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  // Implement user registration or login with Google profile data
}));

export default passport;