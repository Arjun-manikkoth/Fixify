import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
console.log(process.env.REACT_APP_FIXIFY_URL, "backend url");
const socket = io(process.env.REACT_APP_FIXIFY_URL as string);

// Define TypeScript interfaces
interface ChatModalProps {
    senderId: string;
    receiverId: string;
    name: string;
    isOpen: boolean;
    onClose: () => void;
    getChatsApi: (roomId: string) => Promise<any>;
}

interface Message {
    sender: string;
    receiver: string;
    message: string;
    timestamp: string;
}

const ChatModal: React.FC<ChatModalProps> = ({
    senderId,
    receiverId,
    isOpen,
    onClose,
    name,
    getChatsApi,
}) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const roomId =
        senderId < receiverId ? `${senderId}-${receiverId}` : `${receiverId}-${senderId}`;

    useEffect(() => {
        if (isOpen) {
            socket.emit("joinRoom", roomId);

            getChatsApi(roomId).then((response) => {
                if (response.success) {
                    setMessages(response.data);
                }
            });

            socket.on("receiveMessage", (data: Message) => {
                setMessages((prev) => {
                    data.timestamp = new Date().toISOString();

                    return [...prev, data];
                });
            });

            return () => {
                socket.off("receiveMessage");
            };
        }
    }, [isOpen, roomId]);

    // Scroll to bottom whenever messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (message.trim()) {
            const newMessage: Message = {
                message,
                sender: senderId,
                receiver: receiverId,
                timestamp: new Date().toISOString(),
            };
            socket.emit("sendMessage", { roomId, ...newMessage });

            setMessage("");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-[400px] p-4 rounded-xl shadow-lg flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center border-b pb-2">
                    <h2 className="text-lg font-semibold text-gray-700 mx-2">Chat : {name}</h2>
                    <button onClick={onClose} className="text-red-500 text-xl font-bold">
                        &times;
                    </button>
                </div>

                {/* Messages Area */}
                <div className="messages flex flex-col space-y-2 mt-3 p-2 h-80 overflow-auto scrollbar-hide">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${
                                msg.sender === senderId ? "justify-end" : "justify-start"
                            }`}
                        >
                            <div
                                className={`max-w-[75%] p-2 rounded-lg text-md shadow relative ${
                                    msg.sender === senderId
                                        ? "bg-blue-500 text-white self-end ps-4"
                                        : "bg-gray-200 text-gray-800 self-start"
                                }`}
                            >
                                {/* Message Text */}
                                <div>{msg.message}</div>

                                {/* Timestamp */}
                                <div
                                    className={`text-xs mt-1 ${
                                        msg.sender === senderId ? "text-right" : "text-left"
                                    }`}
                                >
                                    {new Intl.DateTimeFormat("en-US", {
                                        timeStyle: "short",
                                    }).format(new Date(msg.timestamp))}
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* This div ensures auto-scrolling to the bottom */}
                    <div ref={messagesEndRef}></div>
                </div>

                {/* Input and Send Button */}
                <div className="flex items-center mt-4">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-grow p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Type a message..."
                    />
                    <button
                        onClick={sendMessage}
                        className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
