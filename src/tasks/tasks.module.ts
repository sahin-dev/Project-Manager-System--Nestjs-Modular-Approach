import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import {  BullModule} from "@nestjs/bull"
import { TasksService } from "./tasks.service"
import { TasksController } from "./tasks.controller"
// import { TasksResolver } from "./tasks.resolver"
import { TaskSchedulerService } from "./services/task-scheduler.service"
import { DependencyResolverService } from "./services/dependency-resolver.service"
import { Task } from "./entities/task.entity"
import { Comment } from "./entities/comment.entity"
import { User } from "../users/entities/user.entity"
import { Project } from "../projects/entities/project.entity"
import { NotificationsModule } from "../notifications/notifications.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Comment, User, Project]),
    BullModule.registerQueue({
      name: "task-notifications",
    }),
    NotificationsModule,
  ],
  providers: [TasksService, TaskSchedulerService, DependencyResolverService],
  controllers: [TasksController],
  exports: [TasksService, TaskSchedulerService, DependencyResolverService],
})
export class TasksModule {}
