"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(notificationRepository, userRepository, notificationQueue) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.notificationQueue = notificationQueue;
        this.logger = new common_2.Logger(NotificationsService_1.name);
    }
    async createNotification(userId, type, title, message, entityId, entityType) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error("User not found");
        }
        const notification = this.notificationRepository.create({
            user,
            type,
            title,
            message,
            entityId,
            entityType,
        });
        const savedNotification = await this.notificationRepository.save(notification);
        await this.notificationQueue.add("process-notification", {
            notificationId: savedNotification.id,
            userId,
        });
        return savedNotification;
    }
    async getUserNotifications(userId, page = 1, limit = 20, isRead) {
        const queryBuilder = this.notificationRepository
            .createQueryBuilder("notification")
            .leftJoinAndSelect("notification.user", "user")
            .where("notification.user.id = :userId", { userId })
            .orderBy("notification.createdAt", "DESC");
        if (isRead !== undefined) {
            queryBuilder.andWhere("notification.isRead = :isRead", { isRead });
        }
        const [notifications, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { notifications, total };
    }
    async markAsRead(notificationId, userId) {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId, user: { id: userId } },
            relations: ["user"],
        });
        if (!notification) {
            throw new Error("Notification not found");
        }
        notification.isRead = true;
        return await this.notificationRepository.save(notification);
    }
    async markAllAsRead(userId) {
        await this.notificationRepository.update({ user: { id: userId }, isRead: false }, { isRead: true });
    }
    async deleteNotification(notificationId, userId) {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId, user: { id: userId } },
        });
        if (!notification) {
            throw new Error("Notification not found");
        }
        await this.notificationRepository.remove(notification);
    }
    async getUnreadCount(userId) {
        return await this.notificationRepository.count({
            where: { user: { id: userId }, isRead: false },
        });
    }
    async sendBulkNotifications(userIds, type, title, message) {
        const notifications = [];
        for (const userId of userIds) {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (user) {
                const notification = this.notificationRepository.create({
                    user,
                    type,
                    title,
                    message,
                });
                notifications.push(notification);
            }
        }
        const savedNotifications = await this.notificationRepository.save(notifications);
        for (const notification of savedNotifications) {
            await this.notificationQueue.add("process-notification", {
                notificationId: notification.id,
                userId: notification.user.id,
            });
        }
    }
    async getNotificationById(id) {
        return await this.notificationRepository.findOne({
            where: { id },
            relations: ["user"],
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Function, Function, Object])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map