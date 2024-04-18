import express from 'express';
import { sendMessage } from '../controller/messageController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();


router.post('/',authenticate, sendMessage);

export default router;
