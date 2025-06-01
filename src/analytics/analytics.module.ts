import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BullModule } from "@nestjs/bull"
import { JwtModule } from "@nestjs/jwt"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { AnalyticsService } from "./analytics.service"
import { AnalyticsController } from "./analytics.controller"
import { AnalyticsResolver } from "./analytics.resolver"
import { Analytics } from "./entities/analytics.entity"
import { Task } from "../tasks/entities/task.entity"
import { Project } from "../projects/entities/project.entity"
import { User } from "../users/entities/user.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([Analytics, Task, Project, User]),
    BullModule.registerQueue({
      name: "analytics-processing",
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
  providers: [AnalyticsService, AnalyticsResolver],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
