import { IResponse } from "../../Services/AdminServices";

interface INotificationRepository {
    unreadNotificationCount(id: string): Promise<IResponse>;
    getNotifications(id: string, page: number): Promise<IResponse>;
    markNotification(id: string): Promise<IResponse>;
}

export default INotificationRepository;
