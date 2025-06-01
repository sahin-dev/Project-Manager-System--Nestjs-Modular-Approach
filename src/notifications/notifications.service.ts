import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Queue } from "bull"
import type { Notification } from "./entities/notification.entity"
import type { User } from "../users/entities/user.entity"
import { Logger } from "@nestjs/common"

export type NotificationType = "TASK_ASSIGNED" | "COMMENT_ADDED" | "DEADLINE_APPROACHING" | "SYSTEM" | "PROJECT_UPDATE"

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)

  constructor(
    private notificationRepository: Repository<Notification>,
    private userRepository: Repository<User>,
    private notificationQueue: Queue,
  ) {}

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    entityId?: string,
    entityType?: string,
  ): Promise<Notification> {
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new Error("User not found")
    }

    const notification = this.notificationRepository.create({
      user,
      type,
      title,
      message,
      entityId,
      entityType,
    })

    const savedNotification = await this.notificationRepository.save(notification)

    // Queue background notification processing (will handle WebSocket delivery)
    await this.notificationQueue.add("process-notification", {
      notificationId: savedNotification.id,
      userId,
    })

    return savedNotification
  }

  async getUserNotifications(
    userId: string,
    page = 1,
    limit = 20,
    isRead?: boolean,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder("notification")
      .leftJoinAndSelect("notification.user", "user")
      .where("notification.user.id = :userId", { userId })
      .orderBy("notification.createdAt", "DESC")

    if (isRead !== undefined) {
      queryBuilder.andWhere("notification.isRead = :isRead", { isRead })
    }

    const [notifications, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return { notifications, total }
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user: { id: userId } },
      relations: ["user"],
    })

    if (!notification) {
      throw new Error("Notification not found")
    }

    notification.isRead = true
    return await this.notificationRepository.save(notification)
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update({ user: { id: userId }, isRead: false }, { isRead: true })
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user: { id: userId } },
    })

    if (!notification) {
      throw new Error("Notification not found")
    }

    await this.notificationRepository.remove(notification)
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { user: { id: userId }, isRead: false },
    })
  }

  async sendBulkNotifications(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
  ): Promise<void> {
    const notifications = []

    for (const userId of userIds) {
      const user = await this.userRepository.findOne({ where: { id: userId } })
      if (user) {
        const notification = this.notificationRepository.create({
          user,
          type,
          title,
          message,
        })
        notifications.push(notification)
      }
    }

    const savedNotifications = await this.notificationRepository.save(notifications)

    // Queue background processing for each notification
    for (const notification of savedNotifications) {
      await this.notificationQueue.add("process-notification", {
        notificationId: notification.id,
        userId: notification.user.id,
      })
    }
  }

  // Method to get a notification by ID
  async getNotificationById(id: string): Promise<Notification> {
    return await this.notificationRepository.findOne({
      where: { id },
      relations: ["user"],
    })
  }
}
