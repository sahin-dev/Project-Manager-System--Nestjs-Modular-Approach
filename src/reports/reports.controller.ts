import { Controller, Get, Param, Query, Res, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"
import type { Response } from "express"
import type { ReportsService } from "./reports.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { Role } from "../common/enums/role.enum"

@ApiTags("reports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("projects/:id")
  @ApiOperation({ summary: "Generate project report" })
  @ApiQuery({ name: "format", required: false, enum: ["pdf", "csv"], description: "Report format" })
  @ApiResponse({ status: 200, description: "Report generated successfully" })
  async generateProjectReport(
    @Param("id") id: string,
    @Query("format") format: "pdf" | "csv" = "pdf",
    @Res() res: Response,
  ) {
    const report = await this.reportsService.generateProjectReport(id, format)
    const filename = `project-report-${id}-${new Date().toISOString().split("T")[0]}`
    await this.reportsService.streamReport(res, report, filename, format)
  }

  @Get("users/:id")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.TEAM_LEAD)
  @ApiOperation({ summary: "Generate user performance report" })
  @ApiQuery({ name: "format", required: false, enum: ["pdf", "csv"] })
  @ApiResponse({ status: 200, description: "Report generated successfully" })
  async generateUserReport(
    @Param("id") id: string,
    @Query("format") format: "pdf" | "csv" = "pdf",
    @Res() res: Response,
  ) {
    const report = await this.reportsService.generateUserReport(id, format)
    const filename = `user-report-${id}-${new Date().toISOString().split("T")[0]}`
    await this.reportsService.streamReport(res, report, filename, format)
  }

  @Get("system")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @ApiOperation({ summary: "Generate system analytics report" })
  @ApiQuery({ name: "format", required: false, enum: ["pdf", "csv"] })
  @ApiResponse({ status: 200, description: "Report generated successfully" })
  async generateSystemReport(@Query("format") format: "pdf" | "csv" = "pdf", @Res() res: Response) {
    const report = await this.reportsService.generateSystemReport(format)
    const filename = `system-report-${new Date().toISOString().split("T")[0]}`
    await this.reportsService.streamReport(res, report, filename, format)
  }
}
