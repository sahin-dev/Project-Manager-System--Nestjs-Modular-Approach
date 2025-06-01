import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Queue } from "bull"
import type { Task } from "./entities/task.entity"
import type { Comment } from "./entities/comment.entity"
import type { User } from "../users/entities/user.entity"
import type { Project } from "../projects/entities/project.entity"
import type { CreateTaskDto } from "./dto/create-task.dto"
import type { UpdateTaskDto } from "./dto/update-task.dto"
import type { CreateCommentDto } from "./dto/create-comment.dto"
import type { TaskSchedulerService } from "./services/task-scheduler.service"
import type { DependencyResolverService } from "./services/dependency-resolver.service"
import { TaskStatus } from "../common/enums/task-status.enum"
import type { TaskPriority } from "../common/enums/task-priority.enum"
import { Role } from "../common/enums/role.enum"

@Injectable()
export class TasksService {
  private taskRepository: Repository<Task>
  private commentRepository: Repository<Comment>
  private userRepository: Repository<User>
  private projectRepository: Repository<Project>
  private notificationQueue: Queue
  private taskSchedulerService: TaskSchedulerService
  private dependencyResolverService: DependencyResolverService

  constructor(
    taskRepository: Repository<Task>,
    commentRepository: Repository<Comment>,
    userRepository: Repository<User>,
    projectRepository: Repository<Project>,
    notificationQueue: Queue,
    taskSchedulerService: TaskSchedulerService,
    dependencyResolverService: DependencyResolverService,
  ) {
    this.taskRepository = taskRepository
    this.commentRepository = commentRepository
    this.userRepository = userRepository
    this.projectRepository = projectRepository
    this.notificationQueue = notificationQueue
    this.taskSchedulerService = taskSchedulerService
    this.dependencyResolverService = dependencyResolverService
  }

  async create(createTaskDto: CreateTaskDto, creatorId: string): Promise<Task> {
    const creator = await this.userRepository.findOne({ where: { id: creatorId } })
    if (!creator) {
      throw new NotFoundException("Creator not found")
    }

    const project = await this.projectRepository.findOne({
      where: { id: createTaskDto.projectId },
      relations: ["members", "owner"],
    })

    if (!project) {
      throw new NotFoundException("Project not found")
    }

    // Check if user has permission to create tasks in this project
    const isMember = project.members.some((member) => member.id === creatorId)
    const isOwner = project.owner.id === creatorId
    const isAdmin = creator.role === Role.ADMIN || creator.role === Role.PROJECT_MANAGER

    if (!isMember && !isOwner && !isAdmin) {
      throw new ForbiddenException("You don't have permission to create tasks in this project")
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      creator,
      project,
    })

    const savedTask = await this.taskRepository.save(task)

    // Queue notification for task creation
    await this.notificationQueue.add("task-created", {
      taskId: savedTask.id,
      creatorId,
      projectId: project.id,
    })

    return await this.findOne(savedTask.id)
  }

  async findAll(
    page = 1,
    limit = 10,
    filters: {
      projectId?: string
      assigneeId?: string
      status?: TaskStatus
      priority?: TaskPriority
      creatorId?: string
    } = {},
  ): Promise<{ tasks: Task[]; total: number }> {
    const queryBuilder = this.taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.project", "project")
      .leftJoinAndSelect("task.creator", "creator")
      .leftJoinAndSelect("task.assignee", "assignee")
      .leftJoinAndSelect("task.dependencies", "dependencies")
      .orderBy("task.createdAt", "DESC")

    if (filters.projectId) {
      queryBuilder.andWhere("project.id = :projectId", { projectId: filters.projectId })
    }

    if (filters.assigneeId) {
      queryBuilder.andWhere("assignee.id = :assigneeId", { assigneeId: filters.assigneeId })
    }

    if (filters.status) {
      queryBuilder.andWhere("task.status = :status", { status: filters.status })
    }

    if (filters.priority) {
      queryBuilder.andWhere("task.priority = :priority", { priority: filters.priority })
    }

    if (filters.creatorId) {
      queryBuilder.andWhere("creator.id = :creatorId", { creatorId: filters.creatorId })
    }

    const [tasks, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return { tasks, total }
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ["project", "creator", "assignee", "dependencies", "blockedBy", "comments", "comments.author"],
    })

    if (!task) {
      throw new NotFoundException("Task not found")
    }

    return task
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id)
    const user = await this.userRepository.findOne({ where: { id: userId } })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    // Check permissions
    const canUpdate = this.canUserModifyTask(task, user)
    if (!canUpdate) {
      throw new ForbiddenException("You don't have permission to update this task")
    }

    const previousStatus = task.status

    await this.taskRepository.update(id, updateTaskDto)
    const updatedTask = await this.findOne(id)

    // Queue notification if status changed
    if (updateTaskDto.status && updateTaskDto.status !== previousStatus) {
      await this.notificationQueue.add("task-status-changed", {
        taskId: id,
        previousStatus,
        newStatus: updateTaskDto.status,
        updatedBy: userId,
      })
    }

    return updatedTask
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id)
    const user = await this.userRepository.findOne({ where: { id: userId } })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    const canDelete = this.canUserModifyTask(task, user)
    if (!canDelete) {
      throw new ForbiddenException("You don't have permission to delete this task")
    }

    await this.taskRepository.remove(task)
  }

  async assignTask(taskId: string, assigneeId?: string): Promise<Task> {
    const task = await this.findOne(taskId)

    let assignee: User | null = null

    if (assigneeId) {
      assignee = await this.userRepository.findOne({ where: { id: assigneeId } })
      if (!assignee) {
        throw new NotFoundException("Assignee not found")
      }
    } else {
      // Use intelligent assignment
      assignee = await this.taskSchedulerService.assignOptimalUser(taskId)
    }

    if (assignee) {
      await this.taskRepository.update(taskId, { assignee })

      // Queue notification for task assignment
      await this.notificationQueue.add("task-assigned", {
        taskId,
        assigneeId: assignee.id,
      })
    }

    return await this.findOne(taskId)
  }

  async addDependencies(taskId: string, dependencyIds: string[]): Promise<Task> {
    const task = await this.findOne(taskId)

    // Validate dependencies to prevent circular references
    await this.dependencyResolverService.validateAndResolveDependencies(taskId, dependencyIds)

    const dependencies = await this.taskRepository.findByIds(dependencyIds)

    if (dependencies.length !== dependencyIds.length) {
      throw new BadRequestException("Some dependency tasks not found")
    }

    task.dependencies = [...(task.dependencies || []), ...dependencies]
    await this.taskRepository.save(task)

    return await this.findOne(taskId)
  }

  async removeDependency(taskId: string, dependencyId: string): Promise<Task> {
    const task = await this.findOne(taskId)

    task.dependencies = task.dependencies?.filter((dep) => dep.id !== dependencyId) || []
    await this.taskRepository.save(task)

    return await this.findOne(taskId)
  }

  async findPrioritized(projectId?: string): Promise<Task[]> {
    return await this.taskSchedulerService.getPrioritizedTasks(projectId)
  }

  async getTasksInExecutionOrder(projectId: string): Promise<Task[]> {
    return await this.dependencyResolverService.getTasksInExecutionOrder(projectId)
  }

  async addComment(taskId: string, createCommentDto: CreateCommentDto, authorId: string): Promise<Comment> {
    const task = await this.findOne(taskId)
    const author = await this.userRepository.findOne({ where: { id: authorId } })

    if (!author) {
      throw new NotFoundException("Author not found")
    }

    const comment = this.commentRepository.create({
      ...createCommentDto,
      task,
      author,
    })

    const savedComment = await this.commentRepository.save(comment)

    // Queue notification for new comment
    await this.notificationQueue.add("comment-added", {
      taskId,
      commentId: savedComment.id,
      authorId,
    })

    return savedComment
  }

  async getTaskComments(taskId: string): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: { task: { id: taskId } },
      relations: ["author"],
      order: { createdAt: "ASC" },
    })
  }

  async getTasksByUser(userId: string, status?: TaskStatus): Promise<Task[]> {
    const queryBuilder = this.taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.project", "project")
      .leftJoinAndSelect("task.creator", "creator")
      .leftJoinAndSelect("task.assignee", "assignee")
      .where("assignee.id = :userId", { userId })
      .orderBy("task.priority", "DESC")
      .addOrderBy("task.dueDate", "ASC")

    if (status) {
      queryBuilder.andWhere("task.status = :status", { status })
    }

    return await queryBuilder.getMany()
  }

  async getOverdueTasks(): Promise<Task[]> {
    return await this.taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.project", "project")
      .leftJoinAndSelect("task.assignee", "assignee")
      .where("task.dueDate < :now", { now: new Date() })
      .andWhere("task.status != :status", { status: TaskStatus.DONE })
      .orderBy("task.dueDate", "ASC")
      .getMany()
  }

  private canUserModifyTask(task: Task, user: User): boolean {
    // Admin and project managers can modify any task
    if (user.role === Role.ADMIN || user.role === Role.PROJECT_MANAGER) {
      return true
    }

    // Task creator can modify their tasks
    if (task.creator.id === user.id) {
      return true
    }

    // Task assignee can modify assigned tasks
    if (task.assignee?.id === user.id) {
      return true
    }

    // Project owner can modify tasks in their project
    if (task.project.owner?.id === user.id) {
      return true
    }

    return false
  }
}
