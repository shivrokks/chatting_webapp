const User = require('../models/User');

// Get all online users (stubbed as all users for now)
const getOnlineUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Search users
const searchUsers = async (req, res) => {
    try {
        const searchQuery = req.query.search || '';
        const query = {
            _id: { $ne: req.user.id },
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } }
            ]
        };

        const users = await User.find(query).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Send friend request
const sendRequest = async (req, res) => {
    try {
        const requestedUserId = req.params.id;
        const currentUserId = req.user.id;

        if (requestedUserId === currentUserId) {
            return res.status(400).json({ message: "Cannot send request to yourself" });
        }

        const [requestedUser, currentUser] = await Promise.all([
            User.findById(requestedUserId),
            User.findById(currentUserId)
        ]);

        if (!requestedUser || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (requestedUser.friendRequests.includes(currentUserId)) {
            return res.status(400).json({ message: "Friend request already sent" });
        }

        if (requestedUser.friends.includes(currentUserId)) {
            return res.status(400).json({ message: "Users are already friends" });
        }

        requestedUser.friendRequests.push(currentUserId);
        await requestedUser.save();

        res.status(200).json({ message: "Friend request sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Accept friend request
const acceptRequest = async (req, res) => {
    try {
        const requestingUserId = req.params.id; // the sender of the request
        const currentUserId = req.user.id;      // the one accepting

        const [requestingUser, currentUser] = await Promise.all([
            User.findById(requestingUserId),
            User.findById(currentUserId)
        ]);

        if (!requestingUser || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Convert all IDs to strings before comparing
        const hasRequest = currentUser.friendRequests.some(
            id => id.toString() === requestingUserId
        );

        if (!hasRequest) {
            return res.status(400).json({ message: "No friend request from this user" });
        }

        // Remove from friendRequests
        currentUser.friendRequests = currentUser.friendRequests.filter(
            id => id.toString() !== requestingUserId
        );

        // Add each other to friends
        currentUser.friends.push(requestingUserId);
        requestingUser.friends.push(currentUserId);

        await Promise.all([currentUser.save(), requestingUser.save()]);

        res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
        console.error("Error accepting friend request:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = {
    getOnlineUsers,
    searchUsers,
    sendRequest,
    acceptRequest
};
