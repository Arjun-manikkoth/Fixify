import { Server } from "socket.io";
import http from "http";
import Notification from "../Models/CommonModels/Notifications";
import Chat from "../Models/CommonModels/ChatModel";

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
    //storing online users
    const activeUsers = new Map<string, string>(); // userId -> socketId

    io.on("connection", (socket) => {
        // Track user when they connect

        socket.on("registerUser", (userId: string) => {
            // Add user to activeUsers
            activeUsers.set(userId, socket.id);

            // Notify all clients that this user is online
            io.emit("userOnline", userId);

            // Send the list of active users to the newly connected user
            const activeUserIds = Array.from(activeUsers.keys());
            socket.emit("activeUsers", activeUserIds);
        });

        // Join a room (For chat)
        socket.on("joinRoom", (roomId) => {
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

        // --------------------- Notification Events ---------------------
        // listens for user join for notifications
        socket.on("joinNotifications", (userId) => {
            socket.join(userId);
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

const sendNotfication = async (receiver_id: string, message: string, type: string) => {
    try {
        //saves notifications to db
        const newNotification = new Notification({ receiver_id, message, type });
        await newNotification.save();

        // Send real-time notification count update
        const unreadCount = await Notification.countDocuments({
            receiver_id: receiver_id,
            is_read: false,
        });

        // send notification to the client
        getIO().to(receiver_id).emit("updateNotificationCount", unreadCount);
    } catch (error: any) {
        console.log(error.message);
    }
};

export { configureSockets, sendNotfication };
