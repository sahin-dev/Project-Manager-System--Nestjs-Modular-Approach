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
var NotificationsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
let NotificationsGateway = NotificationsGateway_1 = class NotificationsGateway {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(NotificationsGateway_1.name);
        this.userSockets = new Map();
    }
    afterInit() {
        this.logger.log("Notifications WebSocket Gateway initialized");
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization;
            if (!token) {
                this.logger.warn("Client connected without token, disconnecting");
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token.replace("Bearer ", ""));
            const userId = payload.sub;
            if (!this.userSockets.has(userId)) {
                this.userSockets.set(userId, []);
            }
            this.userSockets.get(userId).push(client.id);
            client.join(`user:${userId}`);
            this.logger.log(`User ${userId} connected with socket ${client.id}`);
        }
        catch (error) {
            this.logger.error("Connection failed:", error.message);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        for (const [userId, socketIds] of this.userSockets.entries()) {
            const index = socketIds.indexOf(client.id);
            if (index !== -1) {
                socketIds.splice(index, 1);
                if (socketIds.length === 0) {
                    this.userSockets.delete(userId);
                }
                this.logger.log(`Socket ${client.id} for user ${userId} disconnected`);
                break;
            }
        }
    }
    handleJoinRoom(client, data) {
        client.join(data.room);
        this.logger.log(`Socket ${client.id} joined room ${data.room}`);
        return { status: "joined", room: data.room };
    }
    handleLeaveRoom(client, data) {
        client.leave(data.room);
        this.logger.log(`Socket ${client.id} left room ${data.room}`);
        return { status: "left", room: data.room };
    }
    sendNotificationToUser(userId, notification) {
        try {
            this.server.to(`user:${userId}`).emit("notification", notification);
            this.logger.log(`Notification sent to user ${userId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send notification to user ${userId}:`, error.message);
            return false;
        }
    }
    sendNotificationToRoom(room, notification) {
        try {
            this.server.to(room).emit("notification", notification);
            this.logger.log(`Notification sent to room ${room}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send notification to room ${room}:`, error.message);
            return false;
        }
    }
    broadcastNotification(notification) {
        try {
            this.server.emit("notification", notification);
            this.logger.log("Notification broadcasted to all users");
            return true;
        }
        catch (error) {
            this.logger.error("Failed to broadcast notification:", error.message);
            return false;
        }
    }
    getConnectedUsers() {
        return Array.from(this.userSockets.keys());
    }
    isUserConnected(userId) {
        return this.userSockets.has(userId) && this.userSockets.get(userId).length > 0;
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", Function)
], NotificationsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("join-room"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Object]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("leave-room"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Object]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleLeaveRoom", null);
exports.NotificationsGateway = NotificationsGateway = NotificationsGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: "*",
        },
        namespace: "/notifications",
    }),
    __metadata("design:paramtypes", [Function])
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map