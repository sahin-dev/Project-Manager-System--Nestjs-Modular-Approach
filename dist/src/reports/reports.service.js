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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
let ReportsService = class ReportsService {
    constructor(taskRepository, projectRepository, userRepository, analyticsService) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.analyticsService = analyticsService;
    }
    async generateProjectReport(projectId, format = "pdf") {
        const projectAnalytics = await this.analyticsService.getProjectAnalytics(projectId);
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
            relations: ["tasks", "members", "owner"],
        });
        if (!project) {
            throw new Error("Project not found");
        }
        if (format === "csv") {
            return this.generateProjectCSV(project, projectAnalytics);
        }
        else {
            return this.generateProjectPDF(project, projectAnalytics);
        }
    }
    async generateUserReport(userId, format = "pdf") {
        const userAnalytics = await this.analyticsService.getUserAnalytics(userId);
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ["assignedTasks", "ownedProjects"],
        });
        if (!user) {
            throw new Error("User not found");
        }
        if (format === "csv") {
            return this.generateUserCSV(user, userAnalytics);
        }
        else {
            return this.generateUserPDF(user, userAnalytics);
        }
    }
    async generateSystemReport(format = "pdf") {
        const systemAnalytics = await this.analyticsService.getSystemAnalytics();
        if (format === "csv") {
            return this.generateSystemCSV(systemAnalytics);
        }
        else {
            return this.generateSystemPDF(systemAnalytics);
        }
    }
    generateProjectCSV(project, analytics) {
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
        ];
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
        ];
        return [headers.join(","), data.join(",")].join("\n");
    }
    generateUserCSV(user, analytics) {
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
        ];
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
        ];
        return [headers.join(","), data.join(",")].join("\n");
    }
    generateSystemCSV(analytics) {
        const headers = [
            "Total Users",
            "Active Users",
            "Total Projects",
            "Active Projects",
            "Total Tasks",
            "Completed Tasks",
            "Average Project Duration",
            "System Utilization",
        ];
        const data = [
            analytics.totalUsers,
            analytics.activeUsers,
            analytics.totalProjects,
            analytics.activeProjects,
            analytics.totalTasks,
            analytics.completedTasks,
            `${analytics.averageProjectDuration.toFixed(2)} days`,
            `${analytics.systemUtilization.toFixed(2)}%`,
        ];
        let csv = [headers.join(","), data.join(",")].join("\n");
        csv += "\n\nPopular Skills\n";
        csv += "Skill,Count\n";
        analytics.popularSkills.forEach((skill) => {
            csv += `${skill.skill},${skill.count}\n`;
        });
        csv += "\nTask Distribution by Priority\n";
        csv += "Priority,Count\n";
        Object.entries(analytics.taskDistributionByPriority).forEach(([priority, count]) => {
            csv += `${priority},${count}\n`;
        });
        return csv;
    }
    async generateProjectPDF(project, analytics) {
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
      ${project.members.map((member) => `- ${member.firstName} ${member.lastName} (${member.email})`).join("\n")}
    `;
        return Buffer.from(content, "utf-8");
    }
    async generateUserPDF(user, analytics) {
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
    `;
        return Buffer.from(content, "utf-8");
    }
    async generateSystemPDF(analytics) {
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
      ${analytics.popularSkills.map((skill) => `${skill.skill}: ${skill.count} users`).join("\n")}
      
      TASK DISTRIBUTION BY PRIORITY
      -----------------------------
      ${Object.entries(analytics.taskDistributionByPriority)
            .map(([priority, count]) => `${priority}: ${count} tasks`)
            .join("\n")}
    `;
        return Buffer.from(content, "utf-8");
    }
    async streamReport(res, data, filename, format) {
        if (format === "csv") {
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
            res.send(data);
        }
        else {
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}.pdf"`);
            res.send(data);
        }
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Function, Function, Function, Function])
], ReportsService);
//# sourceMappingURL=reports.service.js.map