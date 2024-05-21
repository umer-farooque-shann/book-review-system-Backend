import bcrypt from "bcrypt";
import User from "../models/User.js";
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
        res.json({ accessToken, refreshToken, isAdmin: user.isAdmin,isFirstTimeLogin:user.isFirstTimeLogin });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const refreshToken = async (req, res) => {
    const refreshToken = req.body.refreshToken;
    console.log('Received refresh token:', refreshToken);

    try {
        const userId = await verifyRefreshToken(refreshToken);
        console.log('Decoded user ID:', userId);

        const accessToken = generateAccessToken(userId);
        console.log('Generated access token:', accessToken);

        res.json({ accessToken });
    } catch (error) {
        console.error('Error refreshing access token:', error);
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
export const profile = async (req,res) =>{
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
}

export const addPreferredGenres = async (req, res) => {
    try {
      const userId = req.user.id; // Assuming user ID is stored in req.user.id after authentication
      const { genres } = req.body;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      user.preferredGenres = genres;
      await user.save();
  
      res.status(200).json(user); 
    } catch (error) {
      res.status(400).json({ error: error.message }); // Handle any errors
    }
  };





  export const followUser = async (req, res) => {
    const userId = req.user._id;
    const { followUserId } = req.body;
  
    try {
      const user = await User.findById(userId);
      const followUser = await User.findById(followUserId);
  
      if (!user || !followUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.follow(followUserId);
      followUser.addFollower(userId);
  
      await user.save();
      await followUser.save();
  
      res.status(200).json({ message: `${user.name} is now following ${followUser.name}` });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  export const unfollowUser = async (req, res) => {
    const userId = req.user._id;
    const { unfollowUserId } = req.body;
  
    try {
      const user = await User.findById(userId);
      const unfollowUser = await User.findById(unfollowUserId);
  
      if (!user || !unfollowUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.unfollow(unfollowUserId);
      unfollowUser.removeFollower(userId);
  
      await user.save();
      await unfollowUser.save();
  
      res.status(200).json({ message: `${user.name} has unfollowed ${unfollowUser.name}` });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


  
  export const getUsersWithSimilarGenres = async (req, res) => {
    const userId = req.user._id;
  
    try {
      const user = await User.findById(userId).select('preferredGenres');
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const usersWithSimilarGenres = await User.find({
        _id: { $ne: userId }, // Exclude the current user
        preferredGenres: { $in: user.preferredGenres }
      }).select('-password');
  
      res.status(200).json(usersWithSimilarGenres);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  