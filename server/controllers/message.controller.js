import Message from "../models/Message.js";
import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js"

export const getUserForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteresUsers = await User.find({ _id: { $ne: userId } }).select("-password");


        const unseenMessages = {}
        const promises = filteresUsers.map(async (user) => {
            const messages = await Message.find({ senderId: user._id, receiverId: userId, seen: false })
            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises);
        res.json({ success: true, users: filteresUsers, unseenMessages })


    } catch (err) {
        console.log(err.message)
        res.json({ success: false, message: err.message })
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId }
            ]
        })
        await Message.updateMany({ senderId: selectedUserId, receiverId: myId },
            { seen: true }
        );

        res.json({ success: true, messages })
    } catch (err) {
        console.log(err.message)
        res.json({ success: false, message: err.message })
    }
}

export const markMessageAsSeen = async () => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { seen: true })
        res.json({ success: true })

    } catch (err) {
        console.log(err.message);
        res.json({ success: false, message: err.message })
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        // Create a new object for the message data
        let messageData = { senderId, receiverId };

        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            messageData.image = uploadResponse.secure_url;
        } else if (text) {
            messageData.text = text;
        }

        // Add a check to prevent saving empty messages
        if (!messageData.text && !messageData.image) {
            return res.status(400).json({ success: false, message: "Message content cannot be empty" });
        }

        const newMessage = await Message.create(messageData);

        //Emit the new message to the receiver's socket

        const recieverSocketId = userSocketMap[receiverId];
       
        if (recieverSocketId) {
            io.to(recieverSocketId).emit("newMessage", newMessage)
        }

        res.json({ success: true, message: newMessage })
    } catch (err) {
        console.log(err.message);
        res.json({ success: false, message: err.message })
    }
}