import { createMessage } from '../services/messageService.js';


export const sendMessage = async (req, res) => {
  const senderId = req.user._id;
  const { recipientId, content } = req.body;
  try {
    const message = await createMessage(senderId, recipientId, content);
    res.status(201).json({ message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};


