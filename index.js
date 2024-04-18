import express from "express";
import dotenv from 'dotenv';
import cors from "cors"
import helmet from "helmet"
import connectDB from "./config/dbconfig.js";
import userRouter from "./router/userRouter.js"
import bookRoute from "./router/bookRoute.js"
import groupRoute from "./router/groupRoutes.js"
import messageRoute from "./router/messageRoutes.js"
import passport from './config/auth.js';



const app = express();
dotenv.config();
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST, PATCH, DELETE, OPTIONS");
    next();
});
app.use(cors());
app.use(helmet())
app.use(passport.initialize());


app.use('/api',userRouter)
app.use('/api/book',bookRoute)
app.use('/api/message',messageRoute)
app.use('/api/groups',groupRoute)



const PORT = process.env.PORT || 5000

connectDB().then(() => {
    app.listen(PORT, () => {  
        console.log(`Server running on port -------- \x1b[36mhttp://localhost:${PORT}\x1b[0m ---------(0)` );
    });
});


