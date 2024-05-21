import express from "express";
import { login, registerUser,refreshToken,profile ,addPreferredGenres,followUser,unfollowUser,getUsersWithSimilarGenres } from "../controller/userController.js";
import { authenticate } from "../middleware/authenticate.js";
import passport from '../config/auth.js';
import User from "../models/User.js";
import { signUpWithFacebook, signUpWithTwitter, signUpWithApple, signUpWithGoogle, socialAuthCallback } from '../controller/userController.js';

const router = express.Router()

router.post('/auth/register', registerUser)
router.post('/auth/login', login)
router.get('/auth/protected-route', authenticate, (req, res) => {
    res.json({ message: `Welcome, ${req.user.name}! You have access to this protected route. Test` });
});
router.post('/auth/refresh-token', refreshToken);
router.get('/auth/facebook', signUpWithFacebook);
router.get('/auth/twitter', signUpWithTwitter);
router.get('/auth/apple', signUpWithApple);
router.get('/auth/google', signUpWithGoogle);

router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), socialAuthCallback);
router.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), socialAuthCallback);
router.get('/auth/apple/callback', passport.authenticate('apple', { failureRedirect: '/login' }), socialAuthCallback);
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), socialAuthCallback);

router.get('/auth/profile',authenticate,profile)
router.put('/auth/preferredGenres',authenticate, addPreferredGenres);
router.post('/followUser', authenticate,followUser);
router.post('/unfollowUser',authenticate, unfollowUser);
router.get('/getUsersWithSimilarGenres',authenticate,getUsersWithSimilarGenres)

router.get('/mutualFollowUsers', authenticate, async (req, res) => {
    try {
      const userId = req.user._id;
      // Find users followed by the authenticated user
      const followedByAuthUser = await User.find({ followers: userId });
      // Find users who also follow the authenticated user
      const mutualFollowUsers = followedByAuthUser.filter(user => user.followers.includes(userId));
      res.status(200).json(mutualFollowUsers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

export default router