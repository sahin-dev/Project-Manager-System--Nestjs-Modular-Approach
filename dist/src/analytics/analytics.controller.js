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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const role_enum_1 = require("../common/enums/role.enum");
const analytics_entity_1 = require("./entities/analytics.entity");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async trackEvent(body, user) {
        return await this.analyticsService.trackEvent(body.eventType, body.data, user?.id, body.projectId);
    }
    async getProjectAnalytics(id, startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return await this.analyticsService.getProjectAnalytics(id, start, end);
    }
    async getUserAnalytics(id, startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return await this.analyticsService.getUserAnalytics(id, start, end);
    }
    async getMyAnalytics(user, startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return await this.analyticsService.getUserAnalytics(user.id, start, end);
    }
    async getSystemAnalytics(startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return await this.analyticsService.getSystemAnalytics(start, end);
    }
    async getActivityTimeline(userId, projectId, startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return await this.analyticsService.getActivityTimeline(userId, projectId, start, end);
    }
    async getProductivityTrends(userId, projectId, days = 30) {
        return await this.analyticsService.getProductivityTrends(userId, projectId, days);
    }
    async getTeamPerformance(projectId) {
        return await this.analyticsService.getTeamPerformanceComparison(projectId);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Post)("track"),
    (0, swagger_1.ApiOperation)({ summary: "Track analytics event" }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: "object",
            properties: {
                eventType: { enum: Object.values(analytics_entity_1.AnalyticsEventType) },
                data: { type: "object" },
                projectId: { type: "string", format: "uuid" },
            },
            required: ["eventType", "data"],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Event tracked successfully" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "trackEvent", null);
__decorate([
    (0, common_1.Get)("projects/:id"),
    (0, swagger_1.ApiOperation)({ summary: "Get project analytics" }),
    (0, swagger_1.ApiQuery)({ name: "startDate", required: false, type: String, description: "Start date (ISO string)" }),
    (0, swagger_1.ApiQuery)({ name: "endDate", required: false, type: String, description: "End date (ISO string)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Project analytics retrieved successfully" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)("startDate")),
    __param(2, (0, common_1.Query)("endDate")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getProjectAnalytics", null);
__decorate([
    (0, common_1.Get)("users/:id"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.PROJECT_MANAGER, role_enum_1.Role.TEAM_LEAD),
    (0, swagger_1.ApiOperation)({ summary: "Get user analytics" }),
    (0, swagger_1.ApiQuery)({ name: "startDate", required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: "endDate", required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "User analytics retrieved successfully" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)("startDate")),
    __param(2, (0, common_1.Query)("endDate")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getUserAnalytics", null);
__decorate([
    (0, common_1.Get)("users/me"),
    (0, swagger_1.ApiOperation)({ summary: "Get current user analytics" }),
    (0, swagger_1.ApiQuery)({ name: "startDate", required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: "endDate", required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "User analytics retrieved successfully" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)("startDate")),
    __param(2, (0, common_1.Query)("endDate")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getMyAnalytics", null);
__decorate([
    (0, common_1.Get)("system"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: "Get system-wide analytics" }),
    (0, swagger_1.ApiQuery)({ name: "startDate", required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: "endDate", required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "System analytics retrieved successfully" }),
    __param(0, (0, common_1.Query)("startDate")),
    __param(1, (0, common_1.Query)("endDate")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSystemAnalytics", null);
__decorate([
    (0, common_1.Get)("activity"),
    (0, swagger_1.ApiOperation)({ summary: "Get activity timeline" }),
    (0, swagger_1.ApiQuery)({ name: "userId", required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: "projectId", required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: "startDate", required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: "endDate", required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Activity timeline retrieved successfully" }),
    __param(0, (0, common_1.Query)("userId")),
    __param(1, (0, common_1.Query)("projectId")),
    __param(2, (0, common_1.Query)("startDate")),
    __param(3, (0, common_1.Query)("endDate")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getActivityTimeline", null);
__decorate([
    (0, common_1.Get)("productivity-trends"),
    (0, swagger_1.ApiOperation)({ summary: "Get productivity trends over time" }),
    (0, swagger_1.ApiQuery)({ name: "userId", required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: "projectId", required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: "days", required: false, type: Number, description: "Number of days to analyze" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Productivity trends retrieved successfully" }),
    __param(0, (0, common_1.Query)("userId")),
    __param(1, (0, common_1.Query)("projectId")),
    __param(2, (0, common_1.Query)("days", new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getProductivityTrends", null);
__decorate([
    (0, common_1.Get)("team-performance/:projectId"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.PROJECT_MANAGER, role_enum_1.Role.TEAM_LEAD),
    (0, swagger_1.ApiOperation)({ summary: "Get team performance comparison for a project" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Team performance data retrieved successfully" }),
    __param(0, (0, common_1.Param)("projectId", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTeamPerformance", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)("analytics"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("analytics"),
    __metadata("design:paramtypes", [Function])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map