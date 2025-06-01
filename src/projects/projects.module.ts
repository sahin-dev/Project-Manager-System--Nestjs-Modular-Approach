import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ProjectsService } from "./projects.service"
import { ProjectsController } from "./projects.controller"
// import { ProjectsResolver } from "./projects.resolver"
import { Project } from "./entities/project.entity"
import { User } from "../users/entities/user.entity"
import { Task } from "../tasks/entities/task.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Project, User, Task])],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
