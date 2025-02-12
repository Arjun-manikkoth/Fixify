import { IResponse } from "../../Services/AdminServices";

interface IChatRepository {
    fetchChats(room_id: string): Promise<IResponse>;
}

export default IChatRepository;
