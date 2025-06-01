import { Process, Processor } from "@nestjs/bull"
import { Logger } from "@nestjs/common"
import type { Job } from "bull"
import type { Repository } from "typeorm"
import type { Notification } from "./entities/notification.entity"
import type { NotificationsGateway } from "./notifications.gateway"

@Processor("notifications")
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name)

  constructor(
    private notificationRepository: Repository<Notification>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  @Process("process-notification")
  async processNotification(job: Job<{ notificationId: string; userId: string }>) {
    try {
      const { notificationId, userId } = job.data
      this.logger.log(`Processing notification ${notificationId} for user ${userId}`)

      // Get the notification from the database
      const notification = await this.notificationRepository.findOne({
        where: { id: notificationId },
        relations: ["user"],
      })

      if (!notification) {
        this.logger.warn(`Notification ${notificationId} not found`)
        return
      }

      // Send via WebSocket if user is connected
      if (this.notificationsGateway.isUserConnected(userId)) {
        this.notificationsGateway.sendNotificationToUser(userId, notification)
        this.logger.log(`Real-time notification sent to user ${userId}`)
      } else {
        this.logger.log(`User ${userId} not connected, skipping real-time notification`)
      }

      // Here you would add code to send email, push notification, etc.
      // For example:
      // await this.emailService.sendNotificationEmail(userId, notification)
      // await this.pushService.sendPushNotification(userId, notification)

      this.logger.log(`Notification ${notificationId} processed successfully`)
    } catch (error:any) {
      this.logger.error(`Error processing notification: ${error.message}`, error.stack)
      throw error
    }
  }
}
