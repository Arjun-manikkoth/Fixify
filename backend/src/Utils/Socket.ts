import { Server } from "socket.io";

const configureSockets = (io: Server) => {
    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        // Join a room (User & Provider will be in a unique room)
        socket.on("joinRoom", (roomId) => {
            socket.join(roomId);
        });

        // Handle incoming messages
        socket.on("sendMessage", (data) => {
            const { roomId, message, sender, receiver } = data;

            // Send message to everyone in the room
            io.to(roomId).emit("receiveMessage", { message, sender });

            // Store message in MongoDB
            saveMessageToDB(roomId, sender, receiver, message);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
};

// Save chat message in the database
import Chat from "../Models/CommonModels/ChatModel";

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

export default configureSockets;
