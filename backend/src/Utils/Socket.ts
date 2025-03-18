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
    const activeUsers = new Map<string, string>(); // userId -> socketId

    io.on("connection", (socket) => {
        // Track user when they connect
        socket.on("registerUser", (userId: string) => {
            console.log("user registered", userId);
            // Add user to activeUsers (overwrite if already exists)
            activeUsers.set(userId, socket.id);

            // Notify all clients that this user is online
            io.emit("userOnline", userId);

            // Send the list of active users to the newly connected user
            const activeUserIds = Array.from(activeUsers.keys());
            socket.emit("activeUsers", activeUserIds);
        });

        // Join a room (For chat)
        socket.on("joinRoom", (roomId) => {
            console.log("joined room ", roomId);
            socket.join(roomId);
        });

        // Handle incoming messages (Chat)
        socket.on("sendMessage", (data) => {
            const { roomId, message, sender, receiver } = data;

            // Send message to everyone in the room
            io.to(roomId).emit("receiveMessage", { message, sender });

            // Store message in MongoDB
            saveMessageToDB(roomId, sender, receiver, message);
        });

        // Handle typing events
        socket.on("typing", (receiverId) => {
            io.to(receiverId).emit("typing"); // Notify receiver that the user is typing
        });

        // Handle stop typing events
        socket.on("stopTyping", (receiverId) => {
            io.to(receiverId).emit("stopTyping"); // Notify receiver that the user stopped typing
        });

        // Handle notifications
        socket.on("joinNotifications", (userId) => {
            socket.join(userId); // Join a personal notification room
        });

        socket.on("sendNotification", ({ receiverId, message, type }) => {
            // Send notification to the specific user
            io.to(receiverId).emit("receiveNotification", { message, type });

            // Store notification in the database
            saveNotificationToDB(receiverId, message, type);

            // Update unread notification count
            countUnreadNotifications(receiverId).then((unreadCount) => {
                io.to(receiverId).emit("updateNotificationCount", unreadCount);
            });
        });

        // Handle user disconnect (manual)
        socket.on("disconnectUser", (userId: string) => {
            if (activeUsers.has(userId)) {
                activeUsers.delete(userId);
                io.emit("userOffline", userId); // Notify all clients that the user is offline
            }
        });

        // Handle user disconnect
        socket.on("disconnect", () => {
            // Find the user associated with this socket and mark them as offline
            for (const [userId, socketId] of activeUsers.entries()) {
                if (socketId === socket.id) {
                    activeUsers.delete(userId);
                    io.emit("userOffline", userId); // Notify all clients that the user is offline
                    break;
                }
            }
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
        const newMessage = new Chat({ room_id, sender, receiver, message });
        await newMessage.save();
    } catch (err) {
        console.error("Error saving message:", err);
    }
};

// Save notifications in MongoDB
const saveNotificationToDB = async (receiver_id: string, message: string, type: string) => {
    try {
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
