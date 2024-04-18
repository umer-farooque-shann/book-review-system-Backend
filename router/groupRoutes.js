import express from 'express';
import { createGroup,createPost,joinGroup } from '../controller/groupController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.post('/groups', authenticate, createGroup);
router.post('/groups/:groupSlug/posts', authenticate, createPost);
router.post('/groups/:groupSlug/join', authenticate, joinGroup);

export default router;
