import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  type OnGatewayInit,
} from "@nestjs/websockets"
import type { Server, Socket } from "socket.io"
import { Injectable, Logger } from "@nestjs/common"
import type { JwtService } from "@nestjs/jwt"

@Injectable()
@WebSocketGateway({
  cors: {
    origin: "*",
  },
  namespace: "/notifications",
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(NotificationsGateway.name)
  private userSockets = new Map<string, string[]>() // userId -> socketIds[]

  constructor(private jwtService: JwtService) {}

  afterInit() {
    this.logger.log("Notifications WebSocket Gateway initialized")
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization
      if (!token) {
        this.logger.warn("Client connected without token, disconnecting")
        client.disconnect()
        return
      }

      const payload = this.jwtService.verify(token.replace("Bearer ", ""))
      const userId = payload.sub

      // Add socket to user's socket list
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, [])
      }
      this.userSockets.get(userId).push(client.id)

      // Join user's room
      client.join(`user:${userId}`)

      this.logger.log(`User ${userId} connected with socket ${client.id}`)
    } catch (error:any) {
      this.logger.error("Connection failed:", error.message)
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    // Find and remove socket from userSockets map
    for (const [userId, socketIds] of this.userSockets.entries()) {
      const index = socketIds.indexOf(client.id)
      if (index !== -1) {
        socketIds.splice(index, 1)
        if (socketIds.length === 0) {
          this.userSockets.delete(userId)
        }
        this.logger.log(`Socket ${client.id} for user ${userId} disconnected`)
        break
      }
    }
  }

  @SubscribeMessage("join-room")
  handleJoinRoom(client: Socket, data: { room: string }) {
    client.join(data.room)
    this.logger.log(`Socket ${client.id} joined room ${data.room}`)
    return { status: "joined", room: data.room }
  }

  @SubscribeMessage("leave-room")
  handleLeaveRoom(client: Socket, data: { room: string }) {
    client.leave(data.room)
    this.logger.log(`Socket ${client.id} left room ${data.room}`)
    return { status: "left", room: data.room }
  }

  sendNotificationToUser(userId: string, notification: any) {
    try {
      this.server.to(`user:${userId}`).emit("notification", notification)
      this.logger.log(`Notification sent to user ${userId}`)
      return true
    } catch (error:any) {
      this.logger.error(`Failed to send notification to user ${userId}:`, error.message)
      return false
    }
  }

  sendNotificationToRoom(room: string, notification: any) {
    try {
      this.server.to(room).emit("notification", notification)
      this.logger.log(`Notification sent to room ${room}`)
      return true
    } catch (error:any) {
      this.logger.error(`Failed to send notification to room ${room}:`, error.message)
      return false
    }
  }

  broadcastNotification(notification: any) {
    try {
      this.server.emit("notification", notification)
      this.logger.log("Notification broadcasted to all users")
      return true
    } catch (error:any) {
      this.logger.error("Failed to broadcast notification:", error.message)
      return false
    }
  }

  getConnectedUsers(): string[] {
    return Array.from(this.userSockets.keys())
  }

  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId).length > 0
  }
}
