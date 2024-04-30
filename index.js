import express from "express";
import dotenv from 'dotenv';
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/dbconfig.js";
import userRouter from "./router/userRouter.js";
import bookRoute from "./router/bookRoute.js";
import groupRoute from "./router/groupRoutes.js";
import messageRoute from "./router/messageRoutes.js";
import passport from './config/auth.js';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Replace with your frontend URL
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,PATCH,DELETE,OPTIONS");
    next();
});

// Serve static files
app.use('/public/uploads', express.static(path.join(__dirname, 'public/uploads')));

// CORS configuration

// Routes
app.use('/api', userRouter);
app.use('/api/book', bookRoute);
app.use('/api/message', messageRoute);
app.use('/api/groups', groupRoute);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port --------\x1b[36mhttp://localhost:${PORT}\x1b[0m---------(0)` );
    });
});
