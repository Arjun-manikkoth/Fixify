import { IResponse } from "../Services/AdminServices";
import IChatRepository from "../Interfaces/Chat/IChatRepository";
import Chat from "../Models/CommonModels/ChatModel";

class ChatRepository implements IChatRepository {
    async fetchChats(room_id: string): Promise<IResponse> {
        try {
            console.log(room_id, "room_id");

            const chatList = await Chat.find({ room_id: room_id }).sort({ timeStamp: 1 });

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
