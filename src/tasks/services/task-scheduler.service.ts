import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Task } from "../entities/task.entity"
import type { User } from "../../users/entities/user.entity"
import { TaskPriority } from "../../common/enums/task-priority.enum"
import { TaskStatus } from "@/common/enums/task-status.enum"

interface TaskAssignmentScore {
  user: User
  score: number
  task: Task
}

@Injectable()
export class TaskSchedulerService {
  private taskRepository: Repository<Task>
  private userRepository: Repository<User>

  constructor(taskRepository: Repository<Task>, userRepository: Repository<User>) {
    this.taskRepository = taskRepository
    this.userRepository = userRepository
  }

  /**
   * Intelligent task assignment algorithm based on:
   * - User skills matching task requirements
   * - Current workload
   * - Task priority
   * - User availability
   */
  async assignOptimalUser(taskId: string): Promise<User | null> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ["project", "project.members"],
    })

    if (!task || !task.project?.members) {
      return null
    }

    const availableUsers = task.project.members.filter((user) => user.isActive)
    const scores: TaskAssignmentScore[] = []

    for (const user of availableUsers) {
      const score = await this.calculateAssignmentScore(user, task)
      scores.push({ user, score, task })
    }

    // Sort by score (highest first)
    scores.sort((a, b) => b.score - a.score)

    return scores.length > 0 ? scores[0].user : null
  }

  private async calculateAssignmentScore(user: User, task: Task): Promise<number> {
    let score = 0

    // Skill matching (40% of score)
    const skillMatch = this.calculateSkillMatch(user.skills || [], task.tags || [])
    score += skillMatch * 0.4

    // Workload factor (30% of score) - fewer assigned tasks = higher score
    const currentWorkload = await this.getCurrentWorkload(user.id)
    const workloadScore = Math.max(0, 1 - currentWorkload / 10) // Normalize to 0-1
    score += workloadScore * 0.3

    // Priority factor (20% of score)
    const priorityScore = this.getPriorityScore(task.priority)
    score += priorityScore * 0.2

    // Availability factor (10% of score)
    const availabilityScore = user.isActive ? 1 : 0
    score += availabilityScore * 0.1

    return score
  }

  private calculateSkillMatch(userSkills: string[], taskTags: string[]): number {
    if (taskTags.length === 0) return 0.5 // Neutral score if no specific skills required

    const matchingSkills = userSkills.filter((skill) =>
      taskTags.some((tag) => tag.toLowerCase().includes(skill.toLowerCase())),
    )

    return matchingSkills.length / taskTags.length
  }

  private async getCurrentWorkload(userId: string): Promise<number> {
    return await this.taskRepository.count({
      where: {
        assignee: { id: userId },
        status: TaskStatus.IN_PROGRESS,
      },
    })
  }

  private getPriorityScore(priority: TaskPriority): number {
    const priorityMap = {
      [TaskPriority.CRITICAL]: 1.0,
      [TaskPriority.HIGH]: 0.8,
      [TaskPriority.MEDIUM]: 0.6,
      [TaskPriority.LOW]: 0.4,
    }
    return priorityMap[priority] || 0.5
  }

  /**
   * Priority queue implementation for task scheduling
   */
  async getPrioritizedTasks(projectId?: string): Promise<Task[]> {
    const queryBuilder = this.taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.assignee", "assignee")
      .leftJoinAndSelect("task.project", "project")
      .where("task.status != :status", { status: "done" })

    if (projectId) {
      queryBuilder.andWhere("task.project.id = :projectId", { projectId })
    }

    const tasks = await queryBuilder.getMany()

    // Sort by priority and due date
    return tasks.sort((a, b) => {
      // First, sort by priority
      const priorityOrder: Record<TaskPriority, number> = {
        [TaskPriority.CRITICAL]: 4,
        [TaskPriority.HIGH]: 3,
        [TaskPriority.MEDIUM]: 2,
        [TaskPriority.LOW]: 1,
      }

      const priorityDiff = priorityOrder[b.priority as TaskPriority] - priorityOrder[a.priority as TaskPriority]
      if (priorityDiff !== 0) return priorityDiff

      // Then by due date (earlier dates first)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      if (a.dueDate) return -1
      if (b.dueDate) return 1

      // Finally by creation date
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
  }
}
