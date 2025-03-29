import { IResponse } from "../Services/AdminServices";
import IChatRepository from "../Interfaces/Chat/IChatRepository";
import Chat from "../Models/CommonModels/ChatModel";

class ChatRepository implements IChatRepository {
    async fetchChats(room_id: string): Promise<IResponse> {
        try {
            const chatList = await Chat.find({ room_id: room_id }).sort({ timestamp: 1 });

            return {
                success: true,
                message: "Chat list fetched successfully",
                data: chatList,
            };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Internal server error",
                data: null,
            };
        }
    }
}

export default ChatRepository;
