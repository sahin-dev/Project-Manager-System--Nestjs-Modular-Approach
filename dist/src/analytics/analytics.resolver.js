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
exports.AnalyticsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const analytics_entity_1 = require("./entities/analytics.entity");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const graphql_2 = require("@nestjs/graphql");
let ProjectAnalyticsType = class ProjectAnalyticsType {
};
__decorate([
    (0, graphql_2.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ProjectAnalyticsType.prototype, "projectId", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], ProjectAnalyticsType.prototype, "projectName", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], ProjectAnalyticsType.prototype, "totalTasks", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], ProjectAnalyticsType.prototype, "completedTasks", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], ProjectAnalyticsType.prototype, "inProgressTasks", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], ProjectAnalyticsType.prototype, "todoTasks", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], ProjectAnalyticsType.prototype, "blockedTasks", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Float),
    __metadata("design:type", Number)
], ProjectAnalyticsType.prototype, "completionRate", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Float),
    __metadata("design:type", Number)
], ProjectAnalyticsType.prototype, "averageTaskDuration", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], ProjectAnalyticsType.prototype, "overdueTasksCount", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Float),
    __metadata("design:type", Number)
], ProjectAnalyticsType.prototype, "teamProductivity", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Float),
    __metadata("design:type", Number)
], ProjectAnalyticsType.prototype, "estimationAccuracy", void 0);
ProjectAnalyticsType = __decorate([
    (0, graphql_2.ObjectType)()
], ProjectAnalyticsType);
let UserAnalyticsType = class UserAnalyticsType {
};
__decorate([
    (0, graphql_2.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], UserAnalyticsType.prototype, "userId", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], UserAnalyticsType.prototype, "userName", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], UserAnalyticsType.prototype, "tasksAssigned", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], UserAnalyticsType.prototype, "tasksCompleted", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Float),
    __metadata("design:type", Number)
], UserAnalyticsType.prototype, "averageCompletionTime", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Float),
    __metadata("design:type", Number)
], UserAnalyticsType.prototype, "productivityScore", void 0);
__decorate([
    (0, graphql_2.Field)(() => [String]),
    __metadata("design:type", Array)
], UserAnalyticsType.prototype, "skillUtilization", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Float),
    __metadata("design:type", Number)
], UserAnalyticsType.prototype, "workloadBalance", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Float),
    __metadata("design:type", Number)
], UserAnalyticsType.prototype, "onTimeDeliveryRate", void 0);
UserAnalyticsType = __decorate([
    (0, graphql_2.ObjectType)()
], UserAnalyticsType);
let ProductivityTrendType = class ProductivityTrendType {
};
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], ProductivityTrendType.prototype, "date", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], ProductivityTrendType.prototype, "tasksCompleted", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], ProductivityTrendType.prototype, "hoursLogged", void 0);
ProductivityTrendType = __decorate([
    (0, graphql_2.ObjectType)()
], ProductivityTrendType);
let AnalyticsResolver = class AnalyticsResolver {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    getProjectAnalytics(projectId, startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.analyticsService.getProjectAnalytics(projectId, start, end);
    }
    getUserAnalytics(userId, startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.analyticsService.getUserAnalytics(userId, start, end);
    }
    getMyAnalytics(user, startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.analyticsService.getUserAnalytics(user.id, start, end);
    }
    getActivityTimeline(userId, projectId, startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.analyticsService.getActivityTimeline(userId, projectId, start, end);
    }
    getProductivityTrends(userId, projectId, days) {
        return this.analyticsService.getProductivityTrends(userId, projectId, days);
    }
    getTeamPerformance(projectId) {
        return this.analyticsService.getTeamPerformanceComparison(projectId);
    }
    trackEvent(eventType, data, projectId, user) {
        const parsedData = JSON.parse(data);
        return this.analyticsService.trackEvent(eventType, parsedData, user?.id, projectId);
    }
};
exports.AnalyticsResolver = AnalyticsResolver;
exports.AnalyticsResolver = AnalyticsResolver = __decorate([
    (0, graphql_1.Resolver)(() => analytics_entity_1.Analytics),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [Function])
], AnalyticsResolver);
//# sourceMappingURL=analytics.resolver.js.map