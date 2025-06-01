import { User } from "../../users/entities/user.entity";
export type NotificationType = "TASK_ASSIGNED" | "COMMENT_ADDED" | "DEADLINE_APPROACHING" | "SYSTEM" | "PROJECT_UPDATE";
export declare class Notification {
    id: string;
    user: User;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    entityId: string;
    entityType: string;
    createdAt: Date;
    updatedAt: Date;
}
