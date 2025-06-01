import { type Repository } from "typeorm";
import type { Queue } from "bull";
import { Analytics, AnalyticsEventType } from "./entities/analytics.entity";
import { Task } from "../tasks/entities/task.entity";
import { Project } from "../projects/entities/project.entity";
import { User } from "../users/entities/user.entity";
export interface ProjectAnalytics {
    projectId: string;
    projectName: string;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    blockedTasks: number;
    completionRate: number;
    averageTaskDuration: number;
    overdueTasksCount: number;
    teamProductivity: number;
    estimationAccuracy: number;
}
export interface UserAnalytics {
    userId: string;
    userName: string;
    tasksAssigned: number;
    tasksCompleted: number;
    averageCompletionTime: number;
    productivityScore: number;
    skillUtilization: string[];
    workloadBalance: number;
    onTimeDeliveryRate: number;
}
export interface SystemAnalytics {
    totalUsers: number;
    activeUsers: number;
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
    averageProjectDuration: number;
    systemUtilization: number;
    popularSkills: Array<{
        skill: string;
        count: number;
    }>;
    taskDistributionByPriority: Record<string, number>;
}
export declare class AnalyticsService {
    private analyticsRepository;
    private taskRepository;
    private projectRepository;
    private userRepository;
    private analyticsQueue;
    constructor(analyticsRepository: Repository<Analytics>, taskRepository: Repository<Task>, projectRepository: Repository<Project>, userRepository: Repository<User>, analyticsQueue: Queue);
    trackEvent(eventType: AnalyticsEventType, data: any, userId?: string, projectId?: string): Promise<Analytics>;
    getProjectAnalytics(projectId: string, startDate?: Date, endDate?: Date): Promise<ProjectAnalytics>;
    getUserAnalytics(userId: string, startDate?: Date, endDate?: Date): Promise<UserAnalytics>;
    getSystemAnalytics(startDate?: Date, endDate?: Date): Promise<SystemAnalytics>;
    getActivityTimeline(userId?: string, projectId?: string, startDate?: Date, endDate?: Date): Promise<Analytics[]>;
    getProductivityTrends(userId?: string, projectId?: string, days?: number): Promise<Array<{
        date: string;
        tasksCompleted: number;
        hoursLogged: number;
    }>>;
    getTeamPerformanceComparison(projectId: string): Promise<UserAnalytics[]>;
}
