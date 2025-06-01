import type { Job } from "bull";
import type { Repository } from "typeorm";
import type { Notification } from "./entities/notification.entity";
import type { NotificationsGateway } from "./notifications.gateway";
export declare class NotificationProcessor {
    private notificationRepository;
    private notificationsGateway;
    private readonly logger;
    constructor(notificationRepository: Repository<Notification>, notificationsGateway: NotificationsGateway);
    processNotification(job: Job<{
        notificationId: string;
        userId: string;
    }>): Promise<void>;
}
