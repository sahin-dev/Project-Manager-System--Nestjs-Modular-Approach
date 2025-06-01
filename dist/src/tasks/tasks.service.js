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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const task_status_enum_1 = require("../common/enums/task-status.enum");
const role_enum_1 = require("../common/enums/role.enum");
let TasksService = class TasksService {
    constructor(taskRepository, commentRepository, userRepository, projectRepository, notificationQueue, taskSchedulerService, dependencyResolverService) {
        this.taskRepository = taskRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.notificationQueue = notificationQueue;
        this.taskSchedulerService = taskSchedulerService;
        this.dependencyResolverService = dependencyResolverService;
    }
    async create(createTaskDto, creatorId) {
        const creator = await this.userRepository.findOne({ where: { id: creatorId } });
        if (!creator) {
            throw new common_1.NotFoundException("Creator not found");
        }
        const project = await this.projectRepository.findOne({
            where: { id: createTaskDto.projectId },
            relations: ["members", "owner"],
        });
        if (!project) {
            throw new common_1.NotFoundException("Project not found");
        }
        const isMember = project.members.some((member) => member.id === creatorId);
        const isOwner = project.owner.id === creatorId;
        const isAdmin = creator.role === role_enum_1.Role.ADMIN || creator.role === role_enum_1.Role.PROJECT_MANAGER;
        if (!isMember && !isOwner && !isAdmin) {
            throw new common_1.ForbiddenException("You don't have permission to create tasks in this project");
        }
        const task = this.taskRepository.create({
            ...createTaskDto,
            creator,
            project,
        });
        const savedTask = await this.taskRepository.save(task);
        await this.notificationQueue.add("task-created", {
            taskId: savedTask.id,
            creatorId,
            projectId: project.id,
        });
        return await this.findOne(savedTask.id);
    }
    async findAll(page = 1, limit = 10, filters = {}) {
        const queryBuilder = this.taskRepository
            .createQueryBuilder("task")
            .leftJoinAndSelect("task.project", "project")
            .leftJoinAndSelect("task.creator", "creator")
            .leftJoinAndSelect("task.assignee", "assignee")
            .leftJoinAndSelect("task.dependencies", "dependencies")
            .orderBy("task.createdAt", "DESC");
        if (filters.projectId) {
            queryBuilder.andWhere("project.id = :projectId", { projectId: filters.projectId });
        }
        if (filters.assigneeId) {
            queryBuilder.andWhere("assignee.id = :assigneeId", { assigneeId: filters.assigneeId });
        }
        if (filters.status) {
            queryBuilder.andWhere("task.status = :status", { status: filters.status });
        }
        if (filters.priority) {
            queryBuilder.andWhere("task.priority = :priority", { priority: filters.priority });
        }
        if (filters.creatorId) {
            queryBuilder.andWhere("creator.id = :creatorId", { creatorId: filters.creatorId });
        }
        const [tasks, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { tasks, total };
    }
    async findOne(id) {
        const task = await this.taskRepository.findOne({
            where: { id },
            relations: ["project", "creator", "assignee", "dependencies", "blockedBy", "comments", "comments.author"],
        });
        if (!task) {
            throw new common_1.NotFoundException("Task not found");
        }
        return task;
    }
    async update(id, updateTaskDto, userId) {
        const task = await this.findOne(id);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        const canUpdate = this.canUserModifyTask(task, user);
        if (!canUpdate) {
            throw new common_1.ForbiddenException("You don't have permission to update this task");
        }
        const previousStatus = task.status;
        await this.taskRepository.update(id, updateTaskDto);
        const updatedTask = await this.findOne(id);
        if (updateTaskDto.status && updateTaskDto.status !== previousStatus) {
            await this.notificationQueue.add("task-status-changed", {
                taskId: id,
                previousStatus,
                newStatus: updateTaskDto.status,
                updatedBy: userId,
            });
        }
        return updatedTask;
    }
    async remove(id, userId) {
        const task = await this.findOne(id);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        const canDelete = this.canUserModifyTask(task, user);
        if (!canDelete) {
            throw new common_1.ForbiddenException("You don't have permission to delete this task");
        }
        await this.taskRepository.remove(task);
    }
    async assignTask(taskId, assigneeId) {
        const task = await this.findOne(taskId);
        let assignee = null;
        if (assigneeId) {
            assignee = await this.userRepository.findOne({ where: { id: assigneeId } });
            if (!assignee) {
                throw new common_1.NotFoundException("Assignee not found");
            }
        }
        else {
            assignee = await this.taskSchedulerService.assignOptimalUser(taskId);
        }
        if (assignee) {
            await this.taskRepository.update(taskId, { assignee });
            await this.notificationQueue.add("task-assigned", {
                taskId,
                assigneeId: assignee.id,
            });
        }
        return await this.findOne(taskId);
    }
    async addDependencies(taskId, dependencyIds) {
        const task = await this.findOne(taskId);
        await this.dependencyResolverService.validateAndResolveDependencies(taskId, dependencyIds);
        const dependencies = await this.taskRepository.findByIds(dependencyIds);
        if (dependencies.length !== dependencyIds.length) {
            throw new common_1.BadRequestException("Some dependency tasks not found");
        }
        task.dependencies = [...(task.dependencies || []), ...dependencies];
        await this.taskRepository.save(task);
        return await this.findOne(taskId);
    }
    async removeDependency(taskId, dependencyId) {
        const task = await this.findOne(taskId);
        task.dependencies = task.dependencies?.filter((dep) => dep.id !== dependencyId) || [];
        await this.taskRepository.save(task);
        return await this.findOne(taskId);
    }
    async findPrioritized(projectId) {
        return await this.taskSchedulerService.getPrioritizedTasks(projectId);
    }
    async getTasksInExecutionOrder(projectId) {
        return await this.dependencyResolverService.getTasksInExecutionOrder(projectId);
    }
    async addComment(taskId, createCommentDto, authorId) {
        const task = await this.findOne(taskId);
        const author = await this.userRepository.findOne({ where: { id: authorId } });
        if (!author) {
            throw new common_1.NotFoundException("Author not found");
        }
        const comment = this.commentRepository.create({
            ...createCommentDto,
            task,
            author,
        });
        const savedComment = await this.commentRepository.save(comment);
        await this.notificationQueue.add("comment-added", {
            taskId,
            commentId: savedComment.id,
            authorId,
        });
        return savedComment;
    }
    async getTaskComments(taskId) {
        return await this.commentRepository.find({
            where: { task: { id: taskId } },
            relations: ["author"],
            order: { createdAt: "ASC" },
        });
    }
    async getTasksByUser(userId, status) {
        const queryBuilder = this.taskRepository
            .createQueryBuilder("task")
            .leftJoinAndSelect("task.project", "project")
            .leftJoinAndSelect("task.creator", "creator")
            .leftJoinAndSelect("task.assignee", "assignee")
            .where("assignee.id = :userId", { userId })
            .orderBy("task.priority", "DESC")
            .addOrderBy("task.dueDate", "ASC");
        if (status) {
            queryBuilder.andWhere("task.status = :status", { status });
        }
        return await queryBuilder.getMany();
    }
    async getOverdueTasks() {
        return await this.taskRepository
            .createQueryBuilder("task")
            .leftJoinAndSelect("task.project", "project")
            .leftJoinAndSelect("task.assignee", "assignee")
            .where("task.dueDate < :now", { now: new Date() })
            .andWhere("task.status != :status", { status: task_status_enum_1.TaskStatus.DONE })
            .orderBy("task.dueDate", "ASC")
            .getMany();
    }
    canUserModifyTask(task, user) {
        if (user.role === role_enum_1.Role.ADMIN || user.role === role_enum_1.Role.PROJECT_MANAGER) {
            return true;
        }
        if (task.creator.id === user.id) {
            return true;
        }
        if (task.assignee?.id === user.id) {
            return true;
        }
        if (task.project.owner?.id === user.id) {
            return true;
        }
        return false;
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Function, Function, Function, Function, Object, Function, Function])
], TasksService);
//# sourceMappingURL=tasks.service.js.map