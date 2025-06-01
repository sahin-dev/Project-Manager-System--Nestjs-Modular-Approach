// import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql"
// import { UseGuards } from "@nestjs/common"
// import type { TasksService } from "./tasks.service"
// import { Task } from "./entities/task.entity"
// import { Comment } from "./entities/comment.entity"
// import type { CreateTaskDto } from "./dto/create-task.dto"
// import type { UpdateTaskDto } from "./dto/update-task.dto"
// import type { CreateCommentDto } from "./dto/create-comment.dto"
// import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
// import { CurrentUser } from "../auth/decorators/current-user.decorator"
// import type { User } from "../users/entities/user.entity"
// import { TaskStatus } from "../../common/enums/task-status.enum"
// import { TaskPriority } from "../../common/enums/task-priority.enum"

// @Resolver(() => Task)
// @UseGuards(JwtAuthGuard)
// export class TasksResolver {
//   constructor(private readonly tasksService: TasksService) {}

//   @Query(() => [Task], { name: "tasks" })
//   async findAll(
//     page: number,
//     limit: number,
//     @Args("projectId", { type: () => ID, nullable: true }) projectId?: string,
//     @Args("status", { type: () => TaskStatus, nullable: true }) status?: TaskStatus,
//     @Args("priority", { type: () => TaskPriority, nullable: true }) priority?: TaskPriority,
//   ) {
//     const result = await this.tasksService.findAll(page, limit, { projectId, status, priority })
//     return result.tasks
//   }

//   @Query(() => Task, { name: "task" })
//   async findOne(@Args("id", { type: () => ID }) id: string) {
//     return await this.tasksService.findOne(id)
//   }

//   @Query(() => [Task], { name: "prioritizedTasks" })
//   async findPrioritized(@Args("projectId", { type: () => ID, nullable: true }) projectId?: string) {
//     return await this.tasksService.findPrioritized(projectId)
//   }

//   @Query(() => [Task], { name: "myTasks" })
//   async getMyTasks(
//     @CurrentUser() user: User,
//     @Args("status", { type: () => TaskStatus, nullable: true }) status?: TaskStatus,
//   ) {
//     return await this.tasksService.getTasksByUser(user.id, status)
//   }

//   @Query(() => [Comment], { name: "taskComments" })
//   async getTaskComments(@Args("taskId", { type: () => ID }) taskId: string) {
//     return await this.tasksService.getTaskComments(taskId)
//   }

//   @Mutation(() => Task)
//   async createTask(@Args("createTaskInput") createTaskDto: CreateTaskDto, @CurrentUser() user: User) {
//     return await this.tasksService.create(createTaskDto, user.id)
//   }

//   @Mutation(() => Task)
//   async updateTask(
//     @Args("id", { type: () => ID }) id: string,
//     @Args("updateTaskInput") updateTaskDto: UpdateTaskDto,
//     @CurrentUser() user: User,
//   ) {
//     return await this.tasksService.update(id, updateTaskDto, user.id)
//   }

//   @Mutation(() => Task)
//   async assignTask(
//     @Args("id", { type: () => ID }) id: string,
//     @Args("assigneeId", { type: () => ID, nullable: true }) assigneeId?: string,
//   ) {
//     return await this.tasksService.assignTask(id, assigneeId)
//   }

//   @Mutation(() => Comment)
//   async addComment(
//     @Args("taskId", { type: () => ID }) taskId: string,
//     @Args("createCommentInput") createCommentDto: CreateCommentDto,
//     @CurrentUser() user: User,
//   ) {
//     return await this.tasksService.addComment(taskId, createCommentDto, user.id)
//   }

//   @Mutation(() => Boolean)
//   async removeTask(@Args("id", { type: () => ID }) id: string, @CurrentUser() user: User) {
//     await this.tasksService.remove(id, user.id)
//     return true
//   }
// }
