import Message from '../models/Message.js';


export const createMessage = async (senderId, recipientId, content) => {
  try {
    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      content
    });
    await message.save();
    return message;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to create message');
  }
};
