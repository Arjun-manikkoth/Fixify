import { IResponse } from "../../Services/AdminServices";

interface INotificationRepository {
    unreadNotificationCount(id: string): Promise<IResponse>;
    getNotifications(id: string, page: number): Promise<IResponse>;
}

export default INotificationRepository;
