import { IResponse } from "../Services/AdminServices";
import INotificationRepository from "../Interfaces/Notification/INotificationRepository";
import Notification from "../Models/CommonModels/Notifications";

class NotificationRepository implements INotificationRepository {
    //counts unread notifications with receiver id
    async unreadNotificationCount(id: string): Promise<IResponse> {
        try {
            const count = await Notification.countDocuments({ receiver_id: id, is_read: false });
            return {
                success: true,
                message: "fetched count successfully",
                data: count,
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

    //fetches notifications with receiver id
    async getNotifications(id: string, page: number): Promise<IResponse> {
        try {
            let limit = 10;

            const skip = (page - 1) * limit;

            const notifications = await Notification.find({ receiver_id: id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const totalNotifications = await Notification.countDocuments({ receiver_id: id });

            const totalPages = Math.ceil(totalNotifications / limit);

            return {
                success: true,
                message: "fetched notifications successfully",
                data: { notifications, totalPages },
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

    //mark notification status to read
    async markNotification(id: string): Promise<IResponse> {
        try {
            const updatedStatus = await Notification.updateOne(
                { _id: id },
                { $set: { is_read: true } }
            );

            return updatedStatus.modifiedCount == 1
                ? {
                      success: true,
                      message: "Updated message notification",
                      data: null,
                  }
                : {
                      success: false,
                      message: "Failed to update notification",
                      data: null,
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

export default NotificationRepository;
