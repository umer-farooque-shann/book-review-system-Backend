    import Room from '../models/Room.js';
 
   


    // Define the room controller object
    const roomController = {};

    // Define the socket event handlers
    roomController.handleSocketEvents = (socket, io) => {
        console.log('User connected:', socket.id);

        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
            console.log(`User joined room: ${roomId}`);
        });

        // Handle incoming messages
        socket.on('sendMessage', async ({ roomId, message }) => {
            try {
                await roomController.sendMessage(io, { roomId, message }); // Pass 'io' and message details to sendMessage
            } catch (error) {
                console.error('Error handling message:', error);
            }
        });

        socket.on('startCall', ({ roomId, signal, from }) => {
            socket.to(roomId).emit('groupCallStarted', { signal, from });
        });

        socket.on('signal', ({ roomId, signal, from }) => {
            socket.to(roomId).emit('signal', { signal, from });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    };

    // Implement the sendMessage function
    roomController.sendMessage = async (req, res) => {
        const { roomId, message } = req.body;
        const socketIO = req.io; // Access 'io' from the request object
    
        try {
            // Create a new message instance
            const newMessage = {
                content: message.content,
                sender: message.sender,
                createdAt: new Date() // Optional: Set createdAt field
            };
    
            // Find the room by roomId
            const room = await Room.findById(roomId);
            if (!room) {
                return res.status(404).json({ error: 'Room not found' });
            }
    
            // Add the new message to the room's messages array
            room.messages.push(newMessage);
            await room.save();
    
            // Emit the new message to all clients in the room
            socketIO.to(roomId).emit('newMessage', newMessage);
    
            // Send a success response
            if (res) res.status(200).json({ message: 'Message sent successfully' });
        } catch (error) {
            console.error('Error sending message:', error);
            if (res) res.status(500).json({ error: 'Error sending message' });
        }
    };
    
    // Implement the addMember function
    roomController.addMember = async (req, res) => {
        const { roomId, memberId } = req.body;
        const userId = req.user._id;
        try {
            const room = await Room.findById(roomId);
            if (!room) {
                return res.status(404).json({ error: 'Room not found' });
            }
            if (room.admin.toString() !== userId.toString()) {
                return res.status(403).json({ error: 'Only group admin can add members' });
            }
            const existingMember = room.members.find(member => member.user.toString() === memberId.toString());
            if (existingMember) {
                return res.status(400).json({ error: 'Member already exists in the room' });
            }
            room.members.push({ user: memberId, role: 'member' });
            await room.save();

            res.status(200).json({ message: 'Member added successfully' });
        } catch (error) {
            console.error('Error adding member:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    // Implement the joinRoom function
    roomController.joinRoom = async (req, res) => {
        const { roomId } = req.body;
        try {
            const room = await Room.findById(roomId);
            if (!room) {
                return res.status(404).json({ error: 'Room not found' });
            }
            res.status(200).json(room);
        } catch (error) {
            res.status500().json({ error: error.message });
        }
    };

    // Implement the startCall function
    roomController.startCall = async (req, res) => {
        const { roomId } = req.body;
        const callerId = req.user._id;
        try {
            const room = await Room.findById(roomId);
            if (!room) {
                return res.status(404).json({ error: 'Room not found' });
            }

            const callerIsMember = room.members.some(member => member.user.toString() === callerId.toString());
            if (!callerIsMember) {
                return res.status(403).json({ error: 'Only group members can start a call' });
            }

            const participants = room.members.filter(member => member.user.toString() !== callerId.toString()).map(member => member.user.toString());

            io.to(roomId).emit('groupCallStarted', { roomId, callerId, participants });

            res.status(200).json({ message: 'Group call started successfully' });
        } catch (error) {
            console.error('Error starting group call:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
    roomController.getUserGroups = async (req, res) => {
        try {
            const userId = req.user._id; // Assuming user ID is stored in the request object
            const userGroups = await Room.find({ 'members.user': userId }).populate('admin', 'username');
            res.status(200).json(userGroups);
        } catch (error) {
            console.error('Error fetching user groups:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
    roomController.createRoom = async (req, res) => {
        const { name } = req.body;
        const userId = req.user._id;
    
        try {
            // Create a new room instance
            const newRoom = new Room({
                name: name,
                admin: userId,
                members: [{ user: userId, role: 'admin' }] // The user who creates the room is the admin by default
            });
    
            // Save the new room to the database
            await newRoom.save();
    
            // Send a success response
            res.status(200).json({ message: 'Room created successfully', roomId: newRoom._id });
        } catch (error) {
            console.error('Error creating room:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
    

    // Export the room controller object
    export default roomController;
