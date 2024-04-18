import Group from "../models/Group.js";


export const createGroup = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newGroup = new Group({
            name,
            description,
            admin: req.user._id,
            members: [req.user._id]
        });
        await newGroup.save();
        res.status(201).json({ message: 'Group created successfully', group: newGroup });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create group' });
    }
};
export const createPost = async (req, res) => {
    try {
        const groupSlug = req.params.groupSlug;
        const { content } = req.body;

        const group = await Group.findOne({ slug: groupSlug, members: req.user._id }); // Find group by slug
        if (!group) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }
        group.posts.push({ content, author: req.user._id });
        await group.save();
        res.status(201).json({ message: 'Post created successfully', post: group.posts[group.posts.length - 1] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create post' });
    }
};
export const joinGroup = async (req, res) => {
    try {
        const groupSlug = req.params.groupSlug;
        const userId = req.user._id;
        const group = await Group.findOne({ slug: groupSlug });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (group.members.includes(userId)) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }
        group.members.push(userId);
        await group.save();

        res.json({ message: 'Joined group successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to join group' });
    }
};