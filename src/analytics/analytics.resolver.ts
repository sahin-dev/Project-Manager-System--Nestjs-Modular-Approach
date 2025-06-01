import { Resolver, ID } from "@nestjs/graphql"
import { UseGuards } from "@nestjs/common"
import type { AnalyticsService } from "./analytics.service"
import { Analytics, type AnalyticsEventType } from "./entities/analytics.entity"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import type { User } from "../users/entities/user.entity"
import { ObjectType, Field, Int, Float } from "@nestjs/graphql"

@ObjectType()
class ProjectAnalyticsType {
  @Field(() => ID)
  projectId: string

  @Field()
  projectName: string

  @Field(() => Int)
  totalTasks: number

  @Field(() => Int)
  completedTasks: number

  @Field(() => Int)
  inProgressTasks: number

  @Field(() => Int)
  todoTasks: number

  @Field(() => Int)
  blockedTasks: number

  @Field(() => Float)
  completionRate: number

  @Field(() => Float)
  averageTaskDuration: number

  @Field(() => Int)
  overdueTasksCount: number

  @Field(() => Float)
  teamProductivity: number

  @Field(() => Float)
  estimationAccuracy: number
}

@ObjectType()
class UserAnalyticsType {
  @Field(() => ID)
  userId: string

  @Field()
  userName: string

  @Field(() => Int)
  tasksAssigned: number

  @Field(() => Int)
  tasksCompleted: number

  @Field(() => Float)
  averageCompletionTime: number

  @Field(() => Float)
  productivityScore: number

  @Field(() => [String])
  skillUtilization: string[]

  @Field(() => Float)
  workloadBalance: number

  @Field(() => Float)
  onTimeDeliveryRate: number
}

@ObjectType()
class ProductivityTrendType {
  @Field()
  date: string

  @Field(() => Int)
  tasksCompleted: number

  @Field(() => Int)
  hoursLogged: number
}

@Resolver(() => Analytics)
@UseGuards(JwtAuthGuard)
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  getProjectAnalytics(projectId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return this.analyticsService.getProjectAnalytics(projectId, start, end)
  }

  getUserAnalytics(userId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return this.analyticsService.getUserAnalytics(userId, start, end)
  }

  getMyAnalytics(user: User, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return this.analyticsService.getUserAnalytics(user.id, start, end)
  }

  getActivityTimeline(userId?: string, projectId?: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return this.analyticsService.getActivityTimeline(userId, projectId, start, end)
  }

  getProductivityTrends(userId?: string, projectId?: string, days?: number) {
    return this.analyticsService.getProductivityTrends(userId, projectId, days)
  }

  getTeamPerformance(projectId: string) {
    return this.analyticsService.getTeamPerformanceComparison(projectId)
  }

  trackEvent(eventType: AnalyticsEventType, data: string, projectId?: string, user?: User) {
    const parsedData = JSON.parse(data)
    return this.analyticsService.trackEvent(eventType, parsedData, user?.id, projectId)
  }
}
