"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const task_status_enum_1 = require("../common/enums/task-status.enum");
const task_priority_enum_1 = require("../common/enums/task-priority.enum");
let TasksController = class TasksController {
    constructor(tasksService) {
        this.tasksService = tasksService;
    }
    async create(createTaskDto, user) {
        return await this.tasksService.create(createTaskDto, user.id);
    }
    async findAll(page = 1, limit = 10, projectId, assigneeId, status, priority, creatorId) {
        return await this.tasksService.findAll(page, limit, {
            projectId,
            assigneeId,
            status,
            priority,
            creatorId,
        });
    }
    async findPrioritized(projectId) {
        return await this.tasksService.findPrioritized(projectId);
    }
    async getOverdueTasks() {
        return await this.tasksService.getOverdueTasks();
    }
    async getMyTasks(user, status) {
        return await this.tasksService.getTasksByUser(user.id, status);
    }
    async getExecutionOrder(projectId) {
        return await this.tasksService.getTasksInExecutionOrder(projectId);
    }
    async findOne(id) {
        return await this.tasksService.findOne(id);
    }
    async getComments(id) {
        return await this.tasksService.getTaskComments(id);
    }
    async update(id, updateTaskDto, user) {
        return await this.tasksService.update(id, updateTaskDto, user.id);
    }
    async assignTask(id, assigneeId) {
        return await this.tasksService.assignTask(id, assigneeId);
    }
    async addDependencies(id, dependencyIds) {
        return await this.tasksService.addDependencies(id, dependencyIds);
    }
    async removeDependency(id, dependencyId) {
        return await this.tasksService.removeDependency(id, dependencyId);
    }
    async addComment(id, createCommentDto, user) {
        return await this.tasksService.addComment(id, createCommentDto, user.id);
    }
    async remove(id, user) {
        await this.tasksService.remove(id, user.id);
        return { message: "Task deleted successfully" };
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all tasks with filters and pagination" }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "projectId", required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: "assigneeId", required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: "status", required: false, enum: task_status_enum_1.TaskStatus }),
    (0, swagger_1.ApiQuery)({ name: "priority", required: false, enum: task_priority_enum_1.TaskPriority }),
    (0, swagger_1.ApiQuery)({ name: "creatorId", required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Tasks retrieved successfully" }),
    __param(0, (0, common_1.Query)("page", new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)("limit", new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)("projectId")),
    __param(3, (0, common_1.Query)("assigneeId")),
    __param(4, (0, common_1.Query)("status")),
    __param(5, (0, common_1.Query)("priority")),
    __param(6, (0, common_1.Query)("creatorId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("prioritized"),
    (0, swagger_1.ApiOperation)({ summary: "Get tasks ordered by priority and due date" }),
    (0, swagger_1.ApiQuery)({ name: "projectId", required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Prioritized tasks retrieved successfully" }),
    __param(0, (0, common_1.Query)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findPrioritized", null);
__decorate([
    (0, common_1.Get)("overdue"),
    (0, swagger_1.ApiOperation)({ summary: "Get overdue tasks" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Overdue tasks retrieved successfully" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getOverdueTasks", null);
__decorate([
    (0, common_1.Get)("my-tasks"),
    (0, swagger_1.ApiOperation)({ summary: "Get current user's assigned tasks" }),
    (0, swagger_1.ApiQuery)({ name: "status", required: false, enum: task_status_enum_1.TaskStatus }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "User tasks retrieved successfully" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getMyTasks", null);
__decorate([
    (0, common_1.Get)("execution-order/:projectId"),
    (0, swagger_1.ApiOperation)({ summary: "Get tasks in execution order (considering dependencies)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Tasks in execution order" }),
    __param(0, (0, common_1.Param)("projectId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getExecutionOrder", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get task by ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Task found" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Task not found" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(":id/comments"),
    (0, swagger_1.ApiOperation)({ summary: "Get task comments" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Comments retrieved successfully" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getComments", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Update task" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Task updated successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Task not found" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Forbidden" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function, Function]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(":id/assign"),
    (0, swagger_1.ApiOperation)({ summary: "Assign task to user (auto-assign if no assigneeId provided)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Task assigned successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Task not found" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)("assigneeId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "assignTask", null);
__decorate([
    (0, common_1.Post)(":id/dependencies"),
    (0, swagger_1.ApiOperation)({ summary: "Add task dependencies" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Dependencies added successfully" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Circular dependency detected" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)("dependencyIds")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "addDependencies", null);
__decorate([
    (0, common_1.Delete)(":id/dependencies/:dependencyId"),
    (0, swagger_1.ApiOperation)({ summary: "Remove task dependency" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Dependency removed successfully" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)("dependencyId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "removeDependency", null);
__decorate([
    (0, common_1.Post)(":id/comments"),
    (0, swagger_1.ApiOperation)({ summary: "Add comment to task" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Comment added successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Task not found" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function, Function]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "addComment", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Delete task" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Task deleted successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Task not found" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Forbidden" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "remove", null);
exports.TasksController = TasksController = __decorate([
    (0, swagger_1.ApiTags)("tasks"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("tasks"),
    __metadata("design:paramtypes", [Function])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map