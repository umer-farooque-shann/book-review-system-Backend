import express from "express";
import { login, registerUser,refreshToken,profile } from "../controller/userController.js";
import { authenticate } from "../middleware/authenticate.js";
import passport from '../config/auth.js';
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

export default router