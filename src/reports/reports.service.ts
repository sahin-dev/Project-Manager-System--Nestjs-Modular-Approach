import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Response } from "express"
import type { Task } from "../tasks/entities/task.entity"
import type { Project } from "../projects/entities/project.entity"
import type { User } from "../users/entities/user.entity"
import type { AnalyticsService } from "../analytics/analytics.service"

@Injectable()
export class ReportsService {
  constructor(
    private taskRepository: Repository<Task>,
    private projectRepository: Repository<Project>,
    private userRepository: Repository<User>,
    private analyticsService: AnalyticsService,
  ) {}

  async generateProjectReport(projectId: string, format: "pdf" | "csv" = "pdf"): Promise<Buffer | string> {
    const projectAnalytics = await this.analyticsService.getProjectAnalytics(projectId)
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ["tasks", "members", "owner"],
    })

    if (!project) {
      throw new Error("Project not found")
    }

    if (format === "csv") {
      return this.generateProjectCSV(project, projectAnalytics)
    } else {
      return this.generateProjectPDF(project, projectAnalytics)
    }
  }

  async generateUserReport(userId: string, format: "pdf" | "csv" = "pdf"): Promise<Buffer | string> {
    const userAnalytics = await this.analyticsService.getUserAnalytics(userId)
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["assignedTasks", "ownedProjects"],
    })

    if (!user) {
      throw new Error("User not found")
    }

    if (format === "csv") {
      return this.generateUserCSV(user, userAnalytics)
    } else {
      return this.generateUserPDF(user, userAnalytics)
    }
  }

  async generateSystemReport(format: "pdf" | "csv" = "pdf"): Promise<Buffer | string> {
    const systemAnalytics = await this.analyticsService.getSystemAnalytics()

    if (format === "csv") {
      return this.generateSystemCSV(systemAnalytics)
    } else {
      return this.generateSystemPDF(systemAnalytics)
    }
  }

  private generateProjectCSV(project: any, analytics: any): string {
    const headers = [
      "Project Name",
      "Total Tasks",
      "Completed Tasks",
      "In Progress",
      "Todo",
      "Blocked",
      "Completion Rate",
      "Average Task Duration",
      "Overdue Tasks",
      "Team Productivity",
      "Estimation Accuracy",
    ]

    const data = [
      project.name,
      analytics.stats.totalTasks,
      analytics.stats.completedTasks,
      analytics.stats.inProgressTasks,
      analytics.stats.todoTasks,
      analytics.stats.blockedTasks,
      `${analytics.stats.completionRate.toFixed(2)}%`,
      `${analytics.stats.averageTaskDuration.toFixed(2)} hours`,
      analytics.stats.overdueTasksCount,
      analytics.stats.teamProductivity.toFixed(2),
      `${analytics.stats.estimationAccuracy.toFixed(2)}%`,
    ]

    return [headers.join(","), data.join(",")].join("\n")
  }

  private generateUserCSV(user: any, analytics: any): string {
    const headers = [
      "User Name",
      "Email",
      "Role",
      "Tasks Assigned",
      "Tasks Completed",
      "Average Completion Time",
      "Productivity Score",
      "Workload Balance",
      "On-Time Delivery Rate",
      "Skills",
    ]

    const data = [
      analytics.userName,
      user.email,
      user.role,
      analytics.tasksAssigned,
      analytics.tasksCompleted,
      `${analytics.averageCompletionTime.toFixed(2)} hours`,
      `${analytics.productivityScore.toFixed(2)}%`,
      `${analytics.workloadBalance.toFixed(2)}%`,
      `${analytics.onTimeDeliveryRate.toFixed(2)}%`,
      analytics.skillUtilization.join("; "),
    ]

    return [headers.join(","), data.join(",")].join("\n")
  }

  private generateSystemCSV(analytics: any): string {
    const headers = [
      "Total Users",
      "Active Users",
      "Total Projects",
      "Active Projects",
      "Total Tasks",
      "Completed Tasks",
      "Average Project Duration",
      "System Utilization",
    ]

    const data = [
      analytics.totalUsers,
      analytics.activeUsers,
      analytics.totalProjects,
      analytics.activeProjects,
      analytics.totalTasks,
      analytics.completedTasks,
      `${analytics.averageProjectDuration.toFixed(2)} days`,
      `${analytics.systemUtilization.toFixed(2)}%`,
    ]

    let csv = [headers.join(","), data.join(",")].join("\n")

    // Add popular skills section
    csv += "\n\nPopular Skills\n"
    csv += "Skill,Count\n"
    analytics.popularSkills.forEach((skill: any) => {
      csv += `${skill.skill},${skill.count}\n`
    })

    // Add task distribution section
    csv += "\nTask Distribution by Priority\n"
    csv += "Priority,Count\n"
    Object.entries(analytics.taskDistributionByPriority).forEach(([priority, count]) => {
      csv += `${priority},${count}\n`
    })

    return csv
  }

  private async generateProjectPDF(project: any, analytics: any): Promise<Buffer> {
    // This is a simplified PDF generation
    // In a real implementation, you would use a library like PDFKit or Puppeteer
    const content = `
      PROJECT REPORT
      ==============
      
      Project: ${project.name}
      Description: ${project.description || "N/A"}
      Owner: ${project.owner.firstName} ${project.owner.lastName}
      Created: ${project.createdAt.toDateString()}
      
      STATISTICS
      ----------
      Total Tasks: ${analytics.stats.totalTasks}
      Completed Tasks: ${analytics.stats.completedTasks}
      In Progress: ${analytics.stats.inProgressTasks}
      Todo: ${analytics.stats.todoTasks}
      Blocked: ${analytics.stats.blockedTasks}
      Completion Rate: ${analytics.stats.completionRate.toFixed(2)}%
      Average Task Duration: ${analytics.stats.averageTaskDuration.toFixed(2)} hours
      Overdue Tasks: ${analytics.stats.overdueTasksCount}
      Team Productivity: ${analytics.stats.teamProductivity.toFixed(2)}
      Estimation Accuracy: ${analytics.stats.estimationAccuracy.toFixed(2)}%
      
      TEAM MEMBERS
      ------------
      ${project.members.map((member: any) => `- ${member.firstName} ${member.lastName} (${member.email})`).join("\n")}
    `

    // Convert text to buffer (in real implementation, generate actual PDF)
    return Buffer.from(content, "utf-8")
  }

  private async generateUserPDF(user: any, analytics: any): Promise<Buffer> {
    const content = `
      USER PERFORMANCE REPORT
      =======================
      
      User: ${analytics.userName}
      Email: ${user.email}
      Role: ${user.role}
      Joined: ${user.createdAt.toDateString()}
      
      PERFORMANCE METRICS
      -------------------
      Tasks Assigned: ${analytics.tasksAssigned}
      Tasks Completed: ${analytics.tasksCompleted}
      Average Completion Time: ${analytics.averageCompletionTime.toFixed(2)} hours
      Productivity Score: ${analytics.productivityScore.toFixed(2)}%
      Workload Balance: ${analytics.workloadBalance.toFixed(2)}%
      On-Time Delivery Rate: ${analytics.onTimeDeliveryRate.toFixed(2)}%
      
      SKILLS
      ------
      ${analytics.skillUtilization.join(", ")}
      
      PROJECTS
      --------
      Owned Projects: ${user.ownedProjects?.length || 0}
    `

    return Buffer.from(content, "utf-8")
  }

  private async generateSystemPDF(analytics: any): Promise<Buffer> {
    const content = `
      SYSTEM ANALYTICS REPORT
      =======================
      
      OVERVIEW
      --------
      Total Users: ${analytics.totalUsers}
      Active Users: ${analytics.activeUsers}
      Total Projects: ${analytics.totalProjects}
      Active Projects: ${analytics.activeProjects}
      Total Tasks: ${analytics.totalTasks}
      Completed Tasks: ${analytics.completedTasks}
      Average Project Duration: ${analytics.averageProjectDuration.toFixed(2)} days
      System Utilization: ${analytics.systemUtilization.toFixed(2)}%
      
      POPULAR SKILLS
      --------------
      ${analytics.popularSkills.map((skill: any) => `${skill.skill}: ${skill.count} users`).join("\n")}
      
      TASK DISTRIBUTION BY PRIORITY
      -----------------------------
      ${Object.entries(analytics.taskDistributionByPriority)
        .map(([priority, count]) => `${priority}: ${count} tasks`)
        .join("\n")}
    `

    return Buffer.from(content, "utf-8")
  }

  async streamReport(res: Response, data: Buffer | string, filename: string, format: "pdf" | "csv") {
    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv")
      res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`)
      res.send(data)
    } else {
      res.setHeader("Content-Type", "application/pdf")
      res.setHeader("Content-Disposition", `attachment; filename="${filename}.pdf"`)
      res.send(data)
    }
  }
}
