import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BullModule } from "@nestjs/bull"
import { NotificationsService } from "./notifications.service"
import { NotificationsController } from "./notifications.controller"
import { NotificationsGateway } from "./notifications.gateway"
import { NotificationProcessor } from "./notification.processor"
import { Notification } from "./entities/notification.entity"
import { User } from "../users/entities/user.entity"
import { JwtModule } from "@nestjs/jwt"
import { ConfigModule, ConfigService } from "@nestjs/config"

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User]),
    BullModule.registerQueue({
      name: "notifications",
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET", "your-secret-key"),
        signOptions: { expiresIn: "24h" },
      }),
    }),
  ],
  providers: [NotificationsService, NotificationsGateway, NotificationProcessor],
  controllers: [NotificationsController],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
