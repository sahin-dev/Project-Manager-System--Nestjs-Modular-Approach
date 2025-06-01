import { Controller, Get, Patch, Delete, Param, Query, UseGuards, ParseUUIDPipe, ParseIntPipe } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"
import type { NotificationsService } from "./notifications.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import type { User } from "../users/entities/user.entity"

@ApiTags("notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "Get user notifications" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "isRead", required: false, type: Boolean })
  @ApiResponse({ status: 200, description: "Notifications retrieved successfully" })
  async getNotifications(
    user: User,
    @Query("page", new ParseIntPipe({ optional: true })) page = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 20,
    @Query("isRead") isRead?: boolean,
  ) {
    return await this.notificationsService.getUserNotifications(user.id, page, limit, isRead)
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get unread notifications count" })
  @ApiResponse({ status: 200, description: "Unread count retrieved successfully" })
  async getUnreadCount(user: User) {
    const count = await this.notificationsService.getUnreadCount(user.id)
    return { count }
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark notification as read" })
  @ApiResponse({ status: 200, description: "Notification marked as read" })
  @ApiResponse({ status: 404, description: "Notification not found" })
  async markAsRead(@Param("id", ParseUUIDPipe) id: string, user: User) {
    return await this.notificationsService.markAsRead(id, user.id)
  }

  @Patch("mark-all-read")
  @ApiOperation({ summary: "Mark all notifications as read" })
  @ApiResponse({ status: 200, description: "All notifications marked as read" })
  async markAllAsRead(user: User) {
    await this.notificationsService.markAllAsRead(user.id)
    return { message: "All notifications marked as read" }
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete notification" })
  @ApiResponse({ status: 200, description: "Notification deleted successfully" })
  @ApiResponse({ status: 404, description: "Notification not found" })
  async deleteNotification(@Param("id", ParseUUIDPipe) id: string, user: User) {
    await this.notificationsService.deleteNotification(id, user.id)
    return { message: "Notification deleted successfully" }
  }
}
