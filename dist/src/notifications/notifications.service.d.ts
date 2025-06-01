import type { Repository } from "typeorm";
import type { Queue } from "bull";
import type { Notification } from "./entities/notification.entity";
import type { User } from "../users/entities/user.entity";
export type NotificationType = "TASK_ASSIGNED" | "COMMENT_ADDED" | "DEADLINE_APPROACHING" | "SYSTEM" | "PROJECT_UPDATE";
export declare class NotificationsService {
    private notificationRepository;
    private userRepository;
    private notificationQueue;
    private readonly logger;
    constructor(notificationRepository: Repository<Notification>, userRepository: Repository<User>, notificationQueue: Queue);
    createNotification(userId: string, type: NotificationType, title: string, message: string, entityId?: string, entityType?: string): Promise<Notification>;
    getUserNotifications(userId: string, page?: number, limit?: number, isRead?: boolean): Promise<{
        notifications: Notification[];
        total: number;
    }>;
    markAsRead(notificationId: string, userId: string): Promise<Notification>;
    markAllAsRead(userId: string): Promise<void>;
    deleteNotification(notificationId: string, userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
    sendBulkNotifications(userIds: string[], type: NotificationType, title: string, message: string): Promise<void>;
    getNotificationById(id: string): Promise<Notification>;
}
