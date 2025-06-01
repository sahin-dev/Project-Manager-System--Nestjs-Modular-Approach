import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"
import type { TasksService } from "./tasks.service"
import type { CreateTaskDto } from "./dto/create-task.dto"
import type { UpdateTaskDto } from "./dto/update-task.dto"
import type { CreateCommentDto } from "./dto/create-comment.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import type { User } from "../users/entities/user.entity"
import { TaskStatus } from "../common/enums/task-status.enum"
import { TaskPriority } from "../common/enums/task-priority.enum"

@ApiTags("tasks")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  // @ApiOperation({ summary: "Create a new task" })
  // @ApiResponse({ status: 201, description: "Task created successfully" })
  // @ApiResponse({ status: 400, description: "Bad request" })
  // @ApiResponse({ status: 403, description: "Forbidden" })
  async create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: User) {
    return await this.tasksService.create(createTaskDto, user.id)
  }

  @Get()
  @ApiOperation({ summary: "Get all tasks with filters and pagination" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "projectId", required: false, type: String })
  @ApiQuery({ name: "assigneeId", required: false, type: String })
  @ApiQuery({ name: "status", required: false, enum: TaskStatus })
  @ApiQuery({ name: "priority", required: false, enum: TaskPriority })
  @ApiQuery({ name: "creatorId", required: false, type: String })
  @ApiResponse({ status: 200, description: "Tasks retrieved successfully" })
  async findAll(
    @Query("page", new ParseIntPipe({ optional: true })) page = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 10,
    @Query("projectId") projectId?: string,
    @Query("assigneeId") assigneeId?: string,
    @Query("status") status?: TaskStatus,
    @Query("priority") priority?: TaskPriority,
    @Query("creatorId") creatorId?: string,
  ) {
    return await this.tasksService.findAll(page, limit, {
      projectId,
      assigneeId,
      status,
      priority,
      creatorId,
    })
  }

  @Get("prioritized")
  @ApiOperation({ summary: "Get tasks ordered by priority and due date" })
  @ApiQuery({ name: "projectId", required: false, type: String })
  @ApiResponse({ status: 200, description: "Prioritized tasks retrieved successfully" })
  async findPrioritized(@Query("projectId") projectId?: string) {
    return await this.tasksService.findPrioritized(projectId)
  }

  @Get("overdue")
  @ApiOperation({ summary: "Get overdue tasks" })
  @ApiResponse({ status: 200, description: "Overdue tasks retrieved successfully" })
  async getOverdueTasks() {
    return await this.tasksService.getOverdueTasks()
  }

  @Get("my-tasks")
  @ApiOperation({ summary: "Get current user's assigned tasks" })
  @ApiQuery({ name: "status", required: false, enum: TaskStatus })
  @ApiResponse({ status: 200, description: "User tasks retrieved successfully" })
  async getMyTasks(@CurrentUser() user: User, @Query("status") status?: TaskStatus) {
    return await this.tasksService.getTasksByUser(user.id, status)
  }

  @Get("execution-order/:projectId")
  @ApiOperation({ summary: "Get tasks in execution order (considering dependencies)" })
  @ApiResponse({ status: 200, description: "Tasks in execution order" })
  async getExecutionOrder(@Param("projectId", ParseUUIDPipe) projectId: string) {
    return await this.tasksService.getTasksInExecutionOrder(projectId)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get task by ID" })
  @ApiResponse({ status: 200, description: "Task found" })
  @ApiResponse({ status: 404, description: "Task not found" })
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    return await this.tasksService.findOne(id)
  }

  @Get(":id/comments")
  @ApiOperation({ summary: "Get task comments" })
  @ApiResponse({ status: 200, description: "Comments retrieved successfully" })
  async getComments(@Param("id", ParseUUIDPipe) id: string) {
    return await this.tasksService.getTaskComments(id)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update task" })
  @ApiResponse({ status: 200, description: "Task updated successfully" })
  @ApiResponse({ status: 404, description: "Task not found" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() updateTaskDto: UpdateTaskDto, @CurrentUser() user: User) {
    return await this.tasksService.update(id, updateTaskDto, user.id)
  }

  @Post(":id/assign")
  @ApiOperation({ summary: "Assign task to user (auto-assign if no assigneeId provided)" })
  @ApiResponse({ status: 200, description: "Task assigned successfully" })
  @ApiResponse({ status: 404, description: "Task not found" })
  async assignTask(@Param("id", ParseUUIDPipe) id: string, @Body("assigneeId") assigneeId?: string) {
    return await this.tasksService.assignTask(id, assigneeId)
  }

  @Post(":id/dependencies")
  @ApiOperation({ summary: "Add task dependencies" })
  @ApiResponse({ status: 200, description: "Dependencies added successfully" })
  @ApiResponse({ status: 400, description: "Circular dependency detected" })
  async addDependencies(@Param("id", ParseUUIDPipe) id: string, @Body("dependencyIds") dependencyIds: string[]) {
    return await this.tasksService.addDependencies(id, dependencyIds)
  }

  @Delete(":id/dependencies/:dependencyId")
  @ApiOperation({ summary: "Remove task dependency" })
  @ApiResponse({ status: 200, description: "Dependency removed successfully" })
  async removeDependency(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("dependencyId", ParseUUIDPipe) dependencyId: string,
  ) {
    return await this.tasksService.removeDependency(id, dependencyId)
  }

  @Post(":id/comments")
  @ApiOperation({ summary: "Add comment to task" })
  @ApiResponse({ status: 201, description: "Comment added successfully" })
  @ApiResponse({ status: 404, description: "Task not found" })
  async addComment(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    return await this.tasksService.addComment(id, createCommentDto, user.id)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete task" })
  @ApiResponse({ status: 200, description: "Task deleted successfully" })
  @ApiResponse({ status: 404, description: "Task not found" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async remove(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    await this.tasksService.remove(id, user.id)
    return { message: "Task deleted successfully" }
  }
}
