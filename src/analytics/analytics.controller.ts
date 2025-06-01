import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe, ParseIntPipe } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from "@nestjs/swagger"
import type { AnalyticsService } from "./analytics.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import { Role } from "../common/enums/role.enum"
import type { User } from "../users/entities/user.entity"
import { AnalyticsEventType } from "./entities/analytics.entity"

@ApiTags("analytics")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post("track")
  @ApiOperation({ summary: "Track analytics event" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        eventType: { enum: Object.values(AnalyticsEventType) },
        data: { type: "object" },
        projectId: { type: "string", format: "uuid" },
      },
      required: ["eventType", "data"],
    },
  })
  @ApiResponse({ status: 201, description: "Event tracked successfully" })
  async trackEvent(
    @Body() body: { eventType: AnalyticsEventType; data: any; projectId?: string },
    @CurrentUser() user?: User,
  ) {
    return await this.analyticsService.trackEvent(body.eventType, body.data, user?.id, body.projectId)
  }

  @Get("projects/:id")
  @ApiOperation({ summary: "Get project analytics" })
  @ApiQuery({ name: "startDate", required: false, type: String, description: "Start date (ISO string)" })
  @ApiQuery({ name: "endDate", required: false, type: String, description: "End date (ISO string)" })
  @ApiResponse({ status: 200, description: "Project analytics retrieved successfully" })
  async getProjectAnalytics(
    @Param("id", ParseUUIDPipe) id: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return await this.analyticsService.getProjectAnalytics(id, start, end)
  }

  @Get("users/:id")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.TEAM_LEAD)
  @ApiOperation({ summary: "Get user analytics" })
  @ApiQuery({ name: "startDate", required: false, type: String })
  @ApiQuery({ name: "endDate", required: false, type: String })
  @ApiResponse({ status: 200, description: "User analytics retrieved successfully" })
  async getUserAnalytics(
    @Param("id", ParseUUIDPipe) id: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return await this.analyticsService.getUserAnalytics(id, start, end)
  }

  @Get("users/me")
  @ApiOperation({ summary: "Get current user analytics" })
  @ApiQuery({ name: "startDate", required: false, type: String })
  @ApiQuery({ name: "endDate", required: false, type: String })
  @ApiResponse({ status: 200, description: "User analytics retrieved successfully" })
  async getMyAnalytics(
    @CurrentUser() user: User,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return await this.analyticsService.getUserAnalytics(user.id, start, end)
  }

  @Get("system")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @ApiOperation({ summary: "Get system-wide analytics" })
  @ApiQuery({ name: "startDate", required: false, type: String })
  @ApiQuery({ name: "endDate", required: false, type: String })
  @ApiResponse({ status: 200, description: "System analytics retrieved successfully" })
  async getSystemAnalytics(@Query("startDate") startDate?: string, @Query("endDate") endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return await this.analyticsService.getSystemAnalytics(start, end)
  }

  @Get("activity")
  @ApiOperation({ summary: "Get activity timeline" })
  @ApiQuery({ name: "userId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  @ApiQuery({ name: "startDate", required: false, type: String })
  @ApiQuery({ name: "endDate", required: false, type: String })
  @ApiResponse({ status: 200, description: "Activity timeline retrieved successfully" })
  async getActivityTimeline(
    @Query("userId") userId?: string,
    @Query("projectId") projectId?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return await this.analyticsService.getActivityTimeline(userId, projectId, start, end)
  }

  @Get("productivity-trends")
  @ApiOperation({ summary: "Get productivity trends over time" })
  @ApiQuery({ name: "userId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  @ApiQuery({ name: "days", required: false, type: Number, description: "Number of days to analyze" })
  @ApiResponse({ status: 200, description: "Productivity trends retrieved successfully" })
  async getProductivityTrends(
    @Query("userId") userId?: string,
    @Query("projectId") projectId?: string,
    @Query("days", new ParseIntPipe({ optional: true })) days = 30,
  ) {
    return await this.analyticsService.getProductivityTrends(userId, projectId, days)
  }

  @Get("team-performance/:projectId")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.TEAM_LEAD)
  @ApiOperation({ summary: "Get team performance comparison for a project" })
  @ApiResponse({ status: 200, description: "Team performance data retrieved successfully" })
  async getTeamPerformance(@Param("projectId", ParseUUIDPipe) projectId: string) {
    return await this.analyticsService.getTeamPerformanceComparison(projectId)
  }
}
