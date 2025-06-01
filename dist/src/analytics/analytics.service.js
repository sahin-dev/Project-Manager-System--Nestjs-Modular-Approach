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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const analytics_entity_1 = require("./entities/analytics.entity");
const task_entity_1 = require("../tasks/entities/task.entity");
const project_entity_1 = require("../projects/entities/project.entity");
const user_entity_1 = require("../users/entities/user.entity");
const task_status_enum_1 = require("../common/enums/task-status.enum");
const typeorm_2 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
let AnalyticsService = class AnalyticsService {
    constructor(analyticsRepository, taskRepository, projectRepository, userRepository, analyticsQueue) {
        this.analyticsRepository = analyticsRepository;
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.analyticsQueue = analyticsQueue;
    }
    async trackEvent(eventType, data, userId, projectId) {
        const analytics = this.analyticsRepository.create({
            eventType,
            data,
            user: userId ? { id: userId } : undefined,
            project: projectId ? { id: projectId } : undefined,
        });
        const savedAnalytics = await this.analyticsRepository.save(analytics);
        await this.analyticsQueue.add("process-event", {
            analyticsId: savedAnalytics.id,
            eventType,
            data,
            userId,
            projectId,
        });
        return savedAnalytics;
    }
    async getProjectAnalytics(projectId, startDate, endDate) {
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
            relations: ["tasks", "tasks.assignee"],
        });
        if (!project) {
            throw new Error("Project not found");
        }
        let tasks = project.tasks || [];
        if (startDate && endDate) {
            tasks = tasks.filter((task) => task.createdAt >= startDate && task.createdAt <= endDate);
        }
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((task) => task.status === task_status_enum_1.TaskStatus.DONE).length;
        const inProgressTasks = tasks.filter((task) => task.status === task_status_enum_1.TaskStatus.IN_PROGRESS).length;
        const todoTasks = tasks.filter((task) => task.status === task_status_enum_1.TaskStatus.TODO).length;
        const blockedTasks = tasks.filter((task) => task.status === task_status_enum_1.TaskStatus.BLOCKED).length;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        const completedTasksWithDuration = tasks.filter((task) => task.status === task_status_enum_1.TaskStatus.DONE && task.actualHours > 0);
        const averageTaskDuration = completedTasksWithDuration.length > 0
            ? completedTasksWithDuration.reduce((sum, task) => sum + task.actualHours, 0) /
                completedTasksWithDuration.length
            : 0;
        const now = new Date();
        const overdueTasksCount = tasks.filter((task) => task.dueDate && task.dueDate < now && task.status !== task_status_enum_1.TaskStatus.DONE).length;
        const projectDurationDays = project.startDate
            ? Math.ceil((now.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24))
            : 1;
        const teamProductivity = completedTasks / Math.max(projectDurationDays, 1);
        const tasksWithEstimates = tasks.filter((task) => task.estimatedHours > 0 && task.actualHours > 0);
        const estimationAccuracy = tasksWithEstimates.length > 0
            ? tasksWithEstimates.reduce((sum, task) => {
                const accuracy = Math.min(task.estimatedHours, task.actualHours) / Math.max(task.estimatedHours, task.actualHours);
                return sum + accuracy;
            }, 0) / tasksWithEstimates.length
            : 0;
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
        };
    }
    async getUserAnalytics(userId, startDate, endDate) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ["assignedTasks"],
        });
        if (!user) {
            throw new Error("User not found");
        }
        let tasks = user.assignedTasks || [];
        if (startDate && endDate) {
            tasks = tasks.filter((task) => task.createdAt >= startDate && task.createdAt <= endDate);
        }
        const tasksAssigned = tasks.length;
        const tasksCompleted = tasks.filter((task) => task.status === task_status_enum_1.TaskStatus.DONE).length;
        const completedTasksWithTime = tasks.filter((task) => task.status === task_status_enum_1.TaskStatus.DONE && task.actualHours > 0);
        const averageCompletionTime = completedTasksWithTime.length > 0
            ? completedTasksWithTime.reduce((sum, task) => sum + task.actualHours, 0) / completedTasksWithTime.length
            : 0;
        const productivityScore = tasksAssigned > 0 ? (tasksCompleted / tasksAssigned) * 100 : 0;
        const skillUtilization = tasks
            .flatMap((task) => task.tags || [])
            .filter((tag, index, array) => array.indexOf(tag) === index);
        const activeTasks = tasks.filter((task) => task.status === task_status_enum_1.TaskStatus.IN_PROGRESS || task.status === task_status_enum_1.TaskStatus.TODO).length;
        const workloadBalance = Math.min(activeTasks / 5, 1) * 100;
        const tasksWithDueDate = tasks.filter((task) => task.dueDate && task.status === task_status_enum_1.TaskStatus.DONE);
        const onTimeDeliveries = tasksWithDueDate.filter((task) => task.updatedAt <= task.dueDate).length;
        const onTimeDeliveryRate = tasksWithDueDate.length > 0 ? (onTimeDeliveries / tasksWithDueDate.length) * 100 : 0;
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
        };
    }
    async getSystemAnalytics(startDate, endDate) {
        const dateFilter = startDate && endDate ? (0, typeorm_1.Between)(startDate, endDate) : undefined;
        const totalUsers = await this.userRepository.count();
        const activeUsers = await this.userRepository.count({ where: { isActive: true } });
        const totalProjects = await this.projectRepository.count(dateFilter ? { where: { createdAt: dateFilter } } : {});
        const activeProjects = await this.projectRepository.count({ where: { isActive: true } });
        const totalTasks = await this.taskRepository.count(dateFilter ? { where: { createdAt: dateFilter } } : {});
        const completedTasks = await this.taskRepository.count({
            where: {
                status: task_status_enum_1.TaskStatus.DONE,
                ...(dateFilter ? { createdAt: dateFilter } : {}),
            },
        });
        const projectsWithDates = await this.projectRepository.find({
            where: {
                startDate: dateFilter,
                endDate: dateFilter,
            },
            select: ["startDate", "endDate"],
        });
        const averageProjectDuration = projectsWithDates.length > 0
            ? projectsWithDates
                .filter((p) => p.startDate && p.endDate)
                .reduce((sum, project) => {
                const duration = project.endDate.getTime() - project.startDate.getTime();
                return sum + duration / (1000 * 60 * 60 * 24);
            }, 0) / projectsWithDates.length
            : 0;
        const systemUtilization = totalProjects > 0 ? (activeProjects / totalProjects) * 100 : 0;
        const users = await this.userRepository.find({ select: ["skills"] });
        const skillCounts = new Map();
        users.forEach((user) => {
            if (user.skills) {
                user.skills.forEach((skill) => {
                    skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
                });
            }
        });
        const popularSkills = Array.from(skillCounts.entries())
            .map(([skill, count]) => ({ skill, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        const tasksByPriority = await this.taskRepository
            .createQueryBuilder("task")
            .select("task.priority", "priority")
            .addSelect("COUNT(*)", "count")
            .groupBy("task.priority")
            .getRawMany();
        const taskDistributionByPriority = tasksByPriority.reduce((acc, item) => {
            acc[item.priority] = Number.parseInt(item.count);
            return acc;
        }, {});
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
        };
    }
    async getActivityTimeline(userId, projectId, startDate, endDate) {
        const queryBuilder = this.analyticsRepository
            .createQueryBuilder("analytics")
            .leftJoinAndSelect("analytics.user", "user")
            .leftJoinAndSelect("analytics.project", "project")
            .orderBy("analytics.createdAt", "DESC");
        if (userId) {
            queryBuilder.andWhere("user.id = :userId", { userId });
        }
        if (projectId) {
            queryBuilder.andWhere("project.id = :projectId", { projectId });
        }
        if (startDate && endDate) {
            queryBuilder.andWhere("analytics.createdAt BETWEEN :startDate AND :endDate", {
                startDate,
                endDate,
            });
        }
        return await queryBuilder.take(100).getMany();
    }
    async getProductivityTrends(userId, projectId, days = 30) {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
        const queryBuilder = this.analyticsRepository
            .createQueryBuilder("analytics")
            .select("DATE(analytics.createdAt)", "date")
            .addSelect("COUNT(CASE WHEN analytics.eventType = :taskCompleted THEN 1 END)", "tasksCompleted")
            .addSelect("COALESCE(SUM(CASE WHEN analytics.eventType = :timeLogged THEN CAST(analytics.data->>'hours' AS INTEGER) END), 0)", "hoursLogged")
            .where("analytics.createdAt BETWEEN :startDate AND :endDate", { startDate, endDate })
            .groupBy("DATE(analytics.createdAt)")
            .orderBy("date", "ASC")
            .setParameters({
            taskCompleted: analytics_entity_1.AnalyticsEventType.TASK_COMPLETED,
            timeLogged: analytics_entity_1.AnalyticsEventType.TIME_LOGGED,
        });
        if (userId) {
            queryBuilder.andWhere("analytics.user.id = :userId", { userId });
        }
        if (projectId) {
            queryBuilder.andWhere("analytics.project.id = :projectId", { projectId });
        }
        const results = await queryBuilder.getRawMany();
        return results.map((result) => ({
            date: result.date,
            tasksCompleted: Number.parseInt(result.tasksCompleted) || 0,
            hoursLogged: Number.parseInt(result.hoursLogged) || 0,
        }));
    }
    async getTeamPerformanceComparison(projectId) {
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
            relations: ["members"],
        });
        if (!project) {
            throw new Error("Project not found");
        }
        const teamAnalytics = [];
        for (const member of project.members) {
            const userAnalytics = await this.getUserAnalytics(member.id);
            teamAnalytics.push(userAnalytics);
        }
        return teamAnalytics.sort((a, b) => b.productivityScore - a.productivityScore);
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(analytics_entity_1.Analytics)),
    __param(1, (0, typeorm_2.InjectRepository)(task_entity_1.Task)),
    __param(2, (0, typeorm_2.InjectRepository)(project_entity_1.Project)),
    __param(3, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __param(4, (0, bull_1.InjectQueue)("analytics-processing")),
    __metadata("design:paramtypes", [Function, Function, Function, Function, Object])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map