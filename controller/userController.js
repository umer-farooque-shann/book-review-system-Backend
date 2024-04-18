import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { 
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken 
} from "../config/auth.js";
import passport from 'passport';



export const registerUser = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    const salt = await bcrypt.genSalt(); // password hashing
    const passwordHash = await bcrypt.hash(password, salt);
    try {
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const newUser = new User({
            name,
            email,
            password: passwordHash
        });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const validPassword = await bcrypt.compare(password, user.password); //compare hashed password
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        res.json({ accessToken, refreshToken, isAdmin: user.isAdmin });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const refreshToken = async (req, res) => {
    const refreshToken = req.body.refreshToken;
    try {
        const userId = await verifyRefreshToken(refreshToken);
        const accessToken = generateAccessToken(userId);
        res.json({ accessToken });
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Invalid refresh token' });
    }
};
export const signUpWithFacebook = passport.authenticate('facebook');

export const signUpWithTwitter = passport.authenticate('twitter');

export const signUpWithApple = passport.authenticate('apple');

export const signUpWithGoogle = passport.authenticate('google');

export const socialAuthCallback = (req, res) => {
  res.send('Social authentication successful');
};