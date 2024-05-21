// router/roomRouter.js
import express from 'express';
import roomController from '../controller/roomController.js';
import { authenticate } from '../middleware/authenticate.js';
import Room from '../models/Room.js';


const router = express.Router();

router.post('/create', authenticate, (req, res) => {
    roomController.createRoom(req, res);
});

router.post('/add-member', authenticate, (req, res) => {
    roomController.addMember(req, res);
});

router.post('/join', authenticate, (req, res) => {
    roomController.joinRoom(req, res);
});

router.post('/send-message', authenticate, (req, res) => {
    roomController.sendMessage(req, res);
});
router.get('/groups',authenticate, roomController.getUserGroups);

router.get('/roomMembers', authenticate, async (req, res) => {
    try {
        const { roomId } = req.query;
        const room = await Room.findById(roomId).populate('members.user');
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        const roomMembers = room.members.map(member => member.user);
        res.status(200).json(roomMembers);
    } catch (error) {
        console.error('Error fetching room members:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
