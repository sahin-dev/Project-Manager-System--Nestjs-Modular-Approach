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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let NotificationsController = class NotificationsController {
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async getNotifications(user, page = 1, limit = 20, isRead) {
        return await this.notificationsService.getUserNotifications(user.id, page, limit, isRead);
    }
    async getUnreadCount(user) {
        const count = await this.notificationsService.getUnreadCount(user.id);
        return { count };
    }
    async markAsRead(id, user) {
        return await this.notificationsService.markAsRead(id, user.id);
    }
    async markAllAsRead(user) {
        await this.notificationsService.markAllAsRead(user.id);
        return { message: "All notifications marked as read" };
    }
    async deleteNotification(id, user) {
        await this.notificationsService.deleteNotification(id, user.id);
        return { message: "Notification deleted successfully" };
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Get user notifications" }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "isRead", required: false, type: Boolean }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Notifications retrieved successfully" }),
    __param(1, (0, common_1.Query)("page", new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)("limit", new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)("isRead")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Object, Object, Boolean]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)("unread-count"),
    (0, swagger_1.ApiOperation)({ summary: "Get unread notifications count" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Unread count retrieved successfully" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Patch)(":id/read"),
    (0, swagger_1.ApiOperation)({ summary: "Mark notification as read" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Notification marked as read" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Notification not found" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)("mark-all-read"),
    (0, swagger_1.ApiOperation)({ summary: "Mark all notifications as read" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "All notifications marked as read" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Delete notification" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Notification deleted successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Notification not found" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteNotification", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)("notifications"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("notifications"),
    __metadata("design:paramtypes", [Function])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map