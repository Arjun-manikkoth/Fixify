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
const Notifications_1 = __importDefault(require("../Models/CommonModels/Notifications"));
class NotificationRepository {
    //counts unread notifications with receiver id
    unreadNotificationCount(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const count = yield Notifications_1.default.countDocuments({ receiver_id: id, is_read: false });
                return {
                    success: true,
                    message: "fetched count successfully",
                    data: count,
                };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: "Internal server error",
                    data: null,
                };
            }
        });
    }
    //fetches notifications with receiver id
    getNotifications(id, page) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let limit = 10;
                const skip = (page - 1) * limit;
                const notifications = yield Notifications_1.default.find({ receiver_id: id })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit);
                const totalNotifications = yield Notifications_1.default.countDocuments({ receiver_id: id });
                const totalPages = Math.ceil(totalNotifications / limit);
                return {
                    success: true,
                    message: "fetched notifications successfully",
                    data: { notifications, totalPages },
                };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: "Internal server error",
                    data: null,
                };
            }
        });
    }
    //mark notification status to read
    markNotification(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedStatus = yield Notifications_1.default.updateOne({ _id: id }, { $set: { is_read: true } });
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
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: "Internal server error",
                    data: null,
                };
            }
        });
    }
}
exports.default = NotificationRepository;
