import type { AnalyticsService } from "./analytics.service";
import { Analytics, type AnalyticsEventType } from "./entities/analytics.entity";
import type { User } from "../users/entities/user.entity";
export declare class AnalyticsResolver {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getProjectAnalytics(projectId: string, startDate?: string, endDate?: string): Promise<import("./analytics.service").ProjectAnalytics>;
    getUserAnalytics(userId: string, startDate?: string, endDate?: string): Promise<import("./analytics.service").UserAnalytics>;
    getMyAnalytics(user: User, startDate?: string, endDate?: string): Promise<import("./analytics.service").UserAnalytics>;
    getActivityTimeline(userId?: string, projectId?: string, startDate?: string, endDate?: string): Promise<Analytics[]>;
    getProductivityTrends(userId?: string, projectId?: string, days?: number): Promise<{
        date: string;
        tasksCompleted: number;
        hoursLogged: number;
    }[]>;
    getTeamPerformance(projectId: string): Promise<import("./analytics.service").UserAnalytics[]>;
    trackEvent(eventType: AnalyticsEventType, data: string, projectId?: string, user?: User): Promise<Analytics>;
}
