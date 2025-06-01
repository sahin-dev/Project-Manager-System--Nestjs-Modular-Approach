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
var NotificationProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
let NotificationProcessor = NotificationProcessor_1 = class NotificationProcessor {
    constructor(notificationRepository, notificationsGateway) {
        this.notificationRepository = notificationRepository;
        this.notificationsGateway = notificationsGateway;
        this.logger = new common_1.Logger(NotificationProcessor_1.name);
    }
    async processNotification(job) {
        try {
            const { notificationId, userId } = job.data;
            this.logger.log(`Processing notification ${notificationId} for user ${userId}`);
            const notification = await this.notificationRepository.findOne({
                where: { id: notificationId },
                relations: ["user"],
            });
            if (!notification) {
                this.logger.warn(`Notification ${notificationId} not found`);
                return;
            }
            if (this.notificationsGateway.isUserConnected(userId)) {
                this.notificationsGateway.sendNotificationToUser(userId, notification);
                this.logger.log(`Real-time notification sent to user ${userId}`);
            }
            else {
                this.logger.log(`User ${userId} not connected, skipping real-time notification`);
            }
            this.logger.log(`Notification ${notificationId} processed successfully`);
        }
        catch (error) {
            this.logger.error(`Error processing notification: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.NotificationProcessor = NotificationProcessor;
__decorate([
    (0, bull_1.Process)("process-notification"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationProcessor.prototype, "processNotification", null);
exports.NotificationProcessor = NotificationProcessor = NotificationProcessor_1 = __decorate([
    (0, bull_1.Processor)("notifications"),
    __metadata("design:paramtypes", [Function, Function])
], NotificationProcessor);
//# sourceMappingURL=notification.processor.js.map