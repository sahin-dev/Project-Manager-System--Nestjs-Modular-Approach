import { type OnGatewayConnection, type OnGatewayDisconnect, type OnGatewayInit } from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import type { JwtService } from "@nestjs/jwt";
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private jwtService;
    server: Server;
    private readonly logger;
    private userSockets;
    constructor(jwtService: JwtService);
    afterInit(): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(client: Socket, data: {
        room: string;
    }): {
        status: string;
        room: string;
    };
    handleLeaveRoom(client: Socket, data: {
        room: string;
    }): {
        status: string;
        room: string;
    };
    sendNotificationToUser(userId: string, notification: any): boolean;
    sendNotificationToRoom(room: string, notification: any): boolean;
    broadcastNotification(notification: any): boolean;
    getConnectedUsers(): string[];
    isUserConnected(userId: string): boolean;
}
