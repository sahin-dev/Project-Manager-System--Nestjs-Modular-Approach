import type { NotificationsService } from "./notifications.service";
import type { User } from "../users/entities/user.entity";
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(user: User, page?: number, limit?: number, isRead?: boolean): Promise<{
        notifications: import("./entities/notification.entity").Notification[];
        total: number;
    }>;
    getUnreadCount(user: User): Promise<{
        count: number;
    }>;
    markAsRead(id: string, user: User): Promise<import("./entities/notification.entity").Notification>;
    markAllAsRead(user: User): Promise<{
        message: string;
    }>;
    deleteNotification(id: string, user: User): Promise<{
        message: string;
    }>;
}
