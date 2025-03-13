import { Server } from "socket.io";
import http from "http";
import Chat from "../Models/CommonModels/ChatModel";
import Notification from "../Models/CommonModels/Notifications";

let io: Server;

export const initializeSocket = (server: http.Server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONT_END_URL,
            methods: ["GET", "POST"],
        },
    });
    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized!");
    }
    return io;
};

const configureSockets = (io: Server) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // Join a room (For chat)
        socket.on("joinRoom", (roomId) => {
            console.log("user chat connected", roomId);
            socket.join(roomId);
        });

        // Handle incoming messages (Chat)
        socket.on("sendMessage", (data) => {
            const { roomId, message, sender, receiver } = data;

            // Send message to everyone in the roomd
            io.to(roomId).emit("receiveMessage", { message, sender });

            // Store message in MongoDB
            saveMessageToDB(roomId, sender, receiver, message);
        });

        // ** Handle Notifications **
        socket.on("joinNotifications", (userId) => {
            console.log("user notifications connected", userId);
            socket.join(userId); // Join a personal notification room
        });

        socket.on("sendNotification", ({ receiverId, message, type }) => {
            console.log("send notifications triggered");
            // Send notification to the specific user
            io.to(receiverId).emit("receiveNotification", { message, type });

            // Store notification in the database
            saveNotificationToDB(receiverId, message, type);

            const unreadCount = countUnreadNotifications(receiverId);
            console.log("unread count", unreadCount);

            io.to(receiverId).emit("updateNotificationCount", unreadCount);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
};

// Save chat message in the database
const saveMessageToDB = async (
    room_id: string,
    sender: string,
    receiver: string,
    message: string
) => {
    try {
        console.log("saving messages to db");
        const newMessage = new Chat({ room_id, sender, receiver, message });
        await newMessage.save();
    } catch (err) {
        console.error("Error saving message:", err);
    }
};

// Save notifications in MongoDB
const saveNotificationToDB = async (receiver_id: string, message: string, type: string) => {
    try {
        console.log("saving notifications to db");
        const newNotification = new Notification({ receiver_id, message, type });
        await newNotification.save();
    } catch (err) {
        console.error("Error saving notification:", err);
    }
};

// Save notifications in MongoDB
const countUnreadNotifications = async (receiverId: string) => {
    try {
        // Send real-time notification count update
        const unreadCount = await Notification.countDocuments({
            receiver_id: receiverId,
            is_read: false,
        });
    } catch (err) {
        console.error("Error saving notification:", err);
    }
};

export default configureSockets;
