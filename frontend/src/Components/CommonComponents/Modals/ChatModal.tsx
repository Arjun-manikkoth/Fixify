import { useEffect, useState, useRef } from "react";
import socket from "../../../Socket/Socket";

// Define TypeScript interfaces
interface ChatModalProps {
    profile_url: string;
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
    profile_url,
    senderId,
    receiverId,
    isOpen,
    onClose,
    name,
    getChatsApi,
}) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isOnline, setIsOnline] = useState(false); // Track online status
    const [isTyping, setIsTyping] = useState(false); // Track typing status
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const roomId =
        senderId < receiverId ? `${senderId}-${receiverId}` : `${receiverId}-${senderId}`;

    const handleClose = () => {
        // Emit disconnectUser event to notify the server
        socket.emit("disconnectUser", senderId);

        // Call the original onClose function
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            //join the chat room
            socket.emit("joinRoom", roomId);
            // Register the sender as online
            socket.emit("registerUser", senderId);

            // Fetch chat history
            getChatsApi(roomId).then((response) => {
                if (response.success) {
                    setMessages(response.data);
                }
            });

            // Listen for incoming messages
            socket.on("receiveMessage", (data: Message) => {
                setMessages((prev) => {
                    data.timestamp = new Date().toISOString();
                    return [...prev, data];
                });
            });

            // Listen for the list of active users
            socket.on("activeUsers", (activeUserIds: string[]) => {
                if (activeUserIds.includes(receiverId)) {
                    setIsOnline(true);
                }
            });

            // Listen for online status updates for the RECEIVER (User B)
            socket.on("userOnline", (userId: string) => {
                if (userId === receiverId) {
                    setIsOnline(true);
                }
            });

            socket.on("userOffline", (userId: string) => {
                if (userId === receiverId) {
                    setIsOnline(false);
                }
            });

            // Listen for typing events
            socket.on("typing", () => {
                setIsTyping(true);
            });

            // Listen for stop typing events
            socket.on("stopTyping", () => {
                console.log("stoptyping listened");
                setIsTyping(false);
            });

            return () => {
                // Cleanup listeners
                socket.off("receiveMessage");
                socket.off("activeUsers");
                socket.off("userOnline");
                socket.off("userOffline");
                socket.off("typing");
                socket.off("stopTyping");
            };
        }
    }, [isOpen, roomId, receiverId, senderId]);

    // Scroll to bottom whenever messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle typing events
    useEffect(() => {
        let typingTimeout: NodeJS.Timeout;

        if (message.trim()) {
            // Emit typing event when the user is typing
            socket.emit("typing", receiverId);

            // Set a timeout to emit stopTyping after a delay (e.g., 1 second)
            typingTimeout = setTimeout(() => {
                socket.emit("stopTyping", receiverId);
            }, 1000);
        } else {
            // If the message is empty, emit stopTyping immediately
            socket.emit("stopTyping", receiverId);
        }

        // Cleanup the timeout when the component unmounts or message changes
        return () => {
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
        };
    }, [message, roomId, senderId]);

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md p-4 rounded-xl shadow-lg flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center border-b pb-2">
                    <div className="flex items-center space-x-2">
                        <img
                            src={profile_url}
                            alt="profile.jpg"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700">{name}</h2>
                            <div className="text-sm text-gray-500">
                                {isOnline ? (
                                    <span className="flex items-center">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                        Online
                                    </span>
                                ) : null}
                                {isTyping && <span className="ml-2 text-blue-500">Typing...</span>}
                            </div>
                        </div>
                    </div>
                    <button onClick={handleClose} className="text-red-500 text-xl font-bold">
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
