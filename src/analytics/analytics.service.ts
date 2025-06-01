import { Injectable } from "@nestjs/common"
import { type Repository, Between } from "typeorm"
import type { Queue } from "bull"
import { Analytics, AnalyticsEventType } from "./entities/analytics.entity"
import { Task } from "../tasks/entities/task.entity"
import { Project } from "../projects/entities/project.entity"
import { User } from "../users/entities/user.entity"
import { TaskStatus } from "../common/enums/task-status.enum"
import { InjectRepository } from "@nestjs/typeorm"
import { InjectQueue } from "@nestjs/bull"

export interface ProjectAnalytics {
  projectId: string
  projectName: string
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  todoTasks: number
  blockedTasks: number
  completionRate: number
  averageTaskDuration: number
  overdueTasksCount: number
  teamProductivity: number
  estimationAccuracy: number
}

export interface UserAnalytics {
  userId: string
  userName: string
  tasksAssigned: number
  tasksCompleted: number
  averageCompletionTime: number
  productivityScore: number
  skillUtilization: string[]
  workloadBalance: number
  onTimeDeliveryRate: number
}

export interface SystemAnalytics {
  totalUsers: number
  activeUsers: number
  totalProjects: number
  activeProjects: number
  totalTasks: number
  completedTasks: number
  averageProjectDuration: number
  systemUtilization: number
  popularSkills: Array<{ skill: string; count: number }>
  taskDistributionByPriority: Record<string, number>
}

@Injectable()
export class AnalyticsService {
  private analyticsRepository: Repository<Analytics>
  private taskRepository: Repository<Task>
  private projectRepository: Repository<Project>
  private userRepository: Repository<User>
  private analyticsQueue: Queue

  constructor(
    @InjectRepository(Analytics) analyticsRepository: Repository<Analytics>,
    @InjectRepository(Task) taskRepository: Repository<Task>,
    @InjectRepository(Project) projectRepository: Repository<Project>,
     @InjectRepository(User) userRepository: Repository<User>,
     @InjectQueue("analytics-processing") analyticsQueue: Queue,
  ) {
    this.analyticsRepository = analyticsRepository
    this.taskRepository = taskRepository
    this.projectRepository = projectRepository
    this.userRepository = userRepository
    this.analyticsQueue = analyticsQueue
  }

  async trackEvent(eventType: AnalyticsEventType, data: any, userId?: string, projectId?: string): Promise<Analytics> {
    const analytics = this.analyticsRepository.create({
      eventType,
      data,
      user: userId ? { id: userId } : undefined,
      project: projectId ? { id: projectId } : undefined,
    })

    const savedAnalytics = await this.analyticsRepository.save(analytics)

    // Queue for real-time processing
    await this.analyticsQueue.add("process-event", {
      analyticsId: savedAnalytics.id,
      eventType,
      data,
      userId,
      projectId,
    })

    return savedAnalytics
  }

  async getProjectAnalytics(projectId: string, startDate?: Date, endDate?: Date): Promise<ProjectAnalytics> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ["tasks", "tasks.assignee"],
    })

    if (!project) {
      throw new Error("Project not found")
    }

    let tasks = project.tasks || []

    // Filter by date range if provided
    if (startDate && endDate) {
      tasks = tasks.filter((task) => task.createdAt >= startDate && task.createdAt <= endDate)
    }

    const totalTasks = tasks.length
    const completedTasks = tasks.filter((task) => task.status === TaskStatus.DONE).length
    const inProgressTasks = tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS).length
    const todoTasks = tasks.filter((task) => task.status === TaskStatus.TODO).length
    const blockedTasks = tasks.filter((task) => task.status === TaskStatus.BLOCKED).length

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    // Calculate average task duration for completed tasks
    const completedTasksWithDuration = tasks.filter((task) => task.status === TaskStatus.DONE && task.actualHours > 0)
    const averageTaskDuration =
      completedTasksWithDuration.length > 0
        ? completedTasksWithDuration.reduce((sum, task) => sum + task.actualHours, 0) /
          completedTasksWithDuration.length
        : 0

    // Count overdue tasks
    const now = new Date()
    const overdueTasksCount = tasks.filter(
      (task) => task.dueDate && task.dueDate < now && task.status !== TaskStatus.DONE,
    ).length

    // Calculate team productivity (tasks completed per day)
    const projectDurationDays = project.startDate
      ? Math.ceil((now.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24))
      : 1
    const teamProductivity = completedTasks / Math.max(projectDurationDays, 1)

    // Calculate estimation accuracy
    const tasksWithEstimates = tasks.filter((task) => task.estimatedHours > 0 && task.actualHours > 0)
    const estimationAccuracy =
      tasksWithEstimates.length > 0
        ? tasksWithEstimates.reduce((sum, task) => {
            const accuracy =
              Math.min(task.estimatedHours, task.actualHours) / Math.max(task.estimatedHours, task.actualHours)
            return sum + accuracy
          }, 0) / tasksWithEstimates.length
        : 0

    return {
      projectId,
      projectName: project.name,
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      blockedTasks,
      completionRate,
      averageTaskDuration,
      overdueTasksCount,
      teamProductivity,
      estimationAccuracy: estimationAccuracy * 100,
    }
  }

  async getUserAnalytics(userId: string, startDate?: Date, endDate?: Date): Promise<UserAnalytics> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["assignedTasks"],
    })

    if (!user) {
      throw new Error("User not found")
    }

    let tasks = user.assignedTasks || []

    // Filter by date range if provided
    if (startDate && endDate) {
      tasks = tasks.filter((task) => task.createdAt >= startDate && task.createdAt <= endDate)
    }

    const tasksAssigned = tasks.length
    const tasksCompleted = tasks.filter((task) => task.status === TaskStatus.DONE).length

    // Calculate average completion time
    const completedTasksWithTime = tasks.filter((task) => task.status === TaskStatus.DONE && task.actualHours > 0)
    const averageCompletionTime =
      completedTasksWithTime.length > 0
        ? completedTasksWithTime.reduce((sum, task) => sum + task.actualHours, 0) / completedTasksWithTime.length
        : 0

    // Calculate productivity score (completed tasks / assigned tasks * 100)
    const productivityScore = tasksAssigned > 0 ? (tasksCompleted / tasksAssigned) * 100 : 0

    // Get skill utilization from task tags
    const skillUtilization = tasks
      .flatMap((task) => task.tags || [])
      .filter((tag, index, array) => array.indexOf(tag) === index) // unique tags

    // Calculate workload balance (current active tasks)
    const activeTasks = tasks.filter(
      (task) => task.status === TaskStatus.IN_PROGRESS || task.status === TaskStatus.TODO,
    ).length
    const workloadBalance = Math.min(activeTasks / 5, 1) * 100 // Normalize to 0-100, assuming 5 is optimal

    // Calculate on-time delivery rate
    const tasksWithDueDate = tasks.filter((task) => task.dueDate && task.status === TaskStatus.DONE)
    const onTimeDeliveries = tasksWithDueDate.filter((task) => task.updatedAt <= task.dueDate!).length
    const onTimeDeliveryRate = tasksWithDueDate.length > 0 ? (onTimeDeliveries / tasksWithDueDate.length) * 100 : 0

    return {
      userId,
      userName: `${user.firstName} ${user.lastName}`,
      tasksAssigned,
      tasksCompleted,
      averageCompletionTime,
      productivityScore,
      skillUtilization,
      workloadBalance,
      onTimeDeliveryRate,
    }
  }

  async getSystemAnalytics(startDate?: Date, endDate?: Date): Promise<SystemAnalytics> {
    const dateFilter = startDate && endDate ? Between(startDate, endDate) : undefined

    // User statistics
    const totalUsers = await this.userRepository.count()
    const activeUsers = await this.userRepository.count({ where: { isActive: true } })

    // Project statistics
    const totalProjects = await this.projectRepository.count(dateFilter ? { where: { createdAt: dateFilter } } : {})
    const activeProjects = await this.projectRepository.count({ where: { isActive: true } })

    // Task statistics
    const totalTasks = await this.taskRepository.count(dateFilter ? { where: { createdAt: dateFilter } } : {})
    const completedTasks = await this.taskRepository.count({
      where: {
        status: TaskStatus.DONE,
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
    })

    // Calculate average project duration
    const projectsWithDates = await this.projectRepository.find({
      where: {
        startDate: dateFilter,
        endDate: dateFilter,
      },
      select: ["startDate", "endDate"],
    })

    const averageProjectDuration =
      projectsWithDates.length > 0
        ? projectsWithDates
            .filter((p) => p.startDate && p.endDate)
            .reduce((sum, project) => {
              const duration = project.endDate!.getTime() - project.startDate!.getTime()
              return sum + duration / (1000 * 60 * 60 * 24) // Convert to days
            }, 0) / projectsWithDates.length
        : 0

    // System utilization (active projects / total projects)
    const systemUtilization = totalProjects > 0 ? (activeProjects / totalProjects) * 100 : 0

    // Popular skills analysis
    const users = await this.userRepository.find({ select: ["skills"] })
    const skillCounts = new Map<string, number>()

    users.forEach((user) => {
      if (user.skills) {
        user.skills.forEach((skill) => {
          skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1)
        })
      }
    })

    const popularSkills = Array.from(skillCounts.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Task distribution by priority
    const tasksByPriority = await this.taskRepository
      .createQueryBuilder("task")
      .select("task.priority", "priority")
      .addSelect("COUNT(*)", "count")
      .groupBy("task.priority")
      .getRawMany()

    const taskDistributionByPriority = tasksByPriority.reduce(
      (acc, item) => {
        acc[item.priority] = Number.parseInt(item.count)
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalUsers,
      activeUsers,
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      averageProjectDuration,
      systemUtilization,
      popularSkills,
      taskDistributionByPriority,
    }
  }

  async getActivityTimeline(
    userId?: string,
    projectId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Analytics[]> {
    const queryBuilder = this.analyticsRepository
      .createQueryBuilder("analytics")
      .leftJoinAndSelect("analytics.user", "user")
      .leftJoinAndSelect("analytics.project", "project")
      .orderBy("analytics.createdAt", "DESC")

    if (userId) {
      queryBuilder.andWhere("user.id = :userId", { userId })
    }

    if (projectId) {
      queryBuilder.andWhere("project.id = :projectId", { projectId })
    }

    if (startDate && endDate) {
      queryBuilder.andWhere("analytics.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
    }

    return await queryBuilder.take(100).getMany()
  }

  async getProductivityTrends(
    userId?: string,
    projectId?: string,
    days = 30,
  ): Promise<Array<{ date: string; tasksCompleted: number; hoursLogged: number }>> {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

    const queryBuilder = this.analyticsRepository
      .createQueryBuilder("analytics")
      .select("DATE(analytics.createdAt)", "date")
      .addSelect("COUNT(CASE WHEN analytics.eventType = :taskCompleted THEN 1 END)", "tasksCompleted")
      .addSelect(
        "COALESCE(SUM(CASE WHEN analytics.eventType = :timeLogged THEN CAST(analytics.data->>'hours' AS INTEGER) END), 0)",
        "hoursLogged",
      )
      .where("analytics.createdAt BETWEEN :startDate AND :endDate", { startDate, endDate })
      .groupBy("DATE(analytics.createdAt)")
      .orderBy("date", "ASC")
      .setParameters({
        taskCompleted: AnalyticsEventType.TASK_COMPLETED,
        timeLogged: AnalyticsEventType.TIME_LOGGED,
      })

    if (userId) {
      queryBuilder.andWhere("analytics.user.id = :userId", { userId })
    }

    if (projectId) {
      queryBuilder.andWhere("analytics.project.id = :projectId", { projectId })
    }

    const results = await queryBuilder.getRawMany()

    return results.map((result) => ({
      date: result.date,
      tasksCompleted: Number.parseInt(result.tasksCompleted) || 0,
      hoursLogged: Number.parseInt(result.hoursLogged) || 0,
    }))
  }

  async getTeamPerformanceComparison(projectId: string): Promise<UserAnalytics[]> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ["members"],
    })

    if (!project) {
      throw new Error("Project not found")
    }

    const teamAnalytics: UserAnalytics[] = []

    for (const member of project.members) {
      const userAnalytics = await this.getUserAnalytics(member.id)
      teamAnalytics.push(userAnalytics)
    }

    // Sort by productivity score
    return teamAnalytics.sort((a, b) => b.productivityScore - a.productivityScore)
  }
}
