import type { AnalyticsService } from "./analytics.service";
import type { User } from "../users/entities/user.entity";
import { AnalyticsEventType } from "./entities/analytics.entity";
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    trackEvent(body: {
        eventType: AnalyticsEventType;
        data: any;
        projectId?: string;
    }, user?: User): Promise<import("./entities/analytics.entity").Analytics>;
    getProjectAnalytics(id: string, startDate?: string, endDate?: string): Promise<import("./analytics.service").ProjectAnalytics>;
    getUserAnalytics(id: string, startDate?: string, endDate?: string): Promise<import("./analytics.service").UserAnalytics>;
    getMyAnalytics(user: User, startDate?: string, endDate?: string): Promise<import("./analytics.service").UserAnalytics>;
    getSystemAnalytics(startDate?: string, endDate?: string): Promise<import("./analytics.service").SystemAnalytics>;
    getActivityTimeline(userId?: string, projectId?: string, startDate?: string, endDate?: string): Promise<import("./entities/analytics.entity").Analytics[]>;
    getProductivityTrends(userId?: string, projectId?: string, days?: number): Promise<{
        date: string;
        tasksCompleted: number;
        hoursLogged: number;
    }[]>;
    getTeamPerformance(projectId: string): Promise<import("./analytics.service").UserAnalytics[]>;
}
