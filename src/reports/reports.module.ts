import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ReportsService } from "./reports.service"
import { ReportsController } from "./reports.controller"
import { Task } from "../tasks/entities/task.entity"
import { Project } from "../projects/entities/project.entity"
import { User } from "../users/entities/user.entity"
import { Analytics } from "../analytics/entities/analytics.entity"
import { AnalyticsModule } from "../analytics/analytics.module"

@Module({
  imports: [TypeOrmModule.forFeature([Task, Project, User, Analytics]), AnalyticsModule],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
