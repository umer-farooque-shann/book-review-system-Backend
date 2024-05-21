import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/dbconfig.js';
import userRouter from './router/userRouter.js';
import bookRoute from './router/bookRoute.js';
import groupRoute from './router/groupRoutes.js';
import messageRoute from './router/messageRoutes.js';
import roomRouter from './router/roomRouter.js';
import passport from './config/auth.js';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import roomController from './controller/roomController.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
    },
});

app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use((req, res, next) => {
    req.io = io; // Attach io to the request object
    next();
});
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
    next();
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

app.use('/public/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/api', userRouter);
app.use('/api/book', bookRoute);
app.use('/api/message', messageRoute);
app.use('/api/groups', groupRoute);
app.use('/api/room', roomRouter);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port http://localhost:${PORT}`);
    });
});

// Socket.io event handling
io.on('connection', socket => roomController.handleSocketEvents(socket, io));
