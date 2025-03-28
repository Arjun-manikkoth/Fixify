"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotfication = exports.configureSockets = exports.getIO = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const Notifications_1 = __importDefault(require("../Models/CommonModels/Notifications"));
const ChatModel_1 = __importDefault(require("../Models/CommonModels/ChatModel"));
let io;
const initializeSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.FRONT_END_URL,
            methods: ["GET", "POST"],
        },
    });
    return io;
};
exports.initializeSocket = initializeSocket;
const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized!");
    }
    return io;
};
exports.getIO = getIO;
const configureSockets = (io) => {
    //storing online users
    const activeUsers = new Map(); // userId -> socketId
    io.on("connection", (socket) => {
        // Track user when they connect
        socket.on("registerUser", (userId) => {
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
        socket.on("disconnectUser", (userId) => {
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
exports.configureSockets = configureSockets;
// Save chat message in the database
const saveMessageToDB = (room_id, sender, receiver, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newMessage = new ChatModel_1.default({ room_id, sender, receiver, message });
        yield newMessage.save();
    }
    catch (err) {
        console.error("Error saving message:", err);
    }
});
const sendNotfication = (receiver_id, message, type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //saves notifications to db
        const newNotification = new Notifications_1.default({ receiver_id, message, type });
        yield newNotification.save();
        // Send real-time notification count update
        const unreadCount = yield Notifications_1.default.countDocuments({
            receiver_id: receiver_id,
            is_read: false,
        });
        // send notification to the client
        (0, exports.getIO)().to(receiver_id).emit("updateNotificationCount", unreadCount);
    }
    catch (error) {
        console.log(error.message);
    }
});
exports.sendNotfication = sendNotfication;
