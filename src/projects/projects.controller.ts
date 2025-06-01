import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  ParseBoolPipe,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"
import type { ProjectsService } from "./projects.service"
import type { CreateProjectDto } from "./dto/create-project.dto"
import type { UpdateProjectDto } from "./dto/update-project.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import type { User } from "../users/entities/user.entity"

@ApiTags("projects")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new project" })
  @ApiResponse({ status: 201, description: "Project created successfully" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async create(createProjectDto: CreateProjectDto, @CurrentUser() user: User) {
    return await this.projectsService.create(createProjectDto, user.id)
  }

  @Get()
  @ApiOperation({ summary: "Get all projects with pagination and filters" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "isActive", required: false, type: Boolean })
  @ApiResponse({ status: 200, description: "Projects retrieved successfully" })
  async findAll(
    @Query("page", new ParseIntPipe({ optional: true })) page = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 10,
    @Query("isActive", new ParseBoolPipe({ optional: true })) isActive?: boolean,
    @CurrentUser() user?: User,
  ) {
    return await this.projectsService.findAll(page, limit, user?.id, isActive)
  }

  @Get("my-projects")
  @ApiOperation({ summary: "Get current user's projects" })
  @ApiQuery({ name: "role", required: false, enum: ["owner", "member"] })
  @ApiResponse({ status: 200, description: "User projects retrieved successfully" })
  async getMyProjects(@CurrentUser() user: User, @Query("role") role?: "owner" | "member") {
    return await this.projectsService.getUserProjects(user.id, role)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get project by ID" })
  @ApiResponse({ status: 200, description: "Project found" })
  @ApiResponse({ status: 404, description: "Project not found" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findOne(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return await this.projectsService.findOne(id, user.id)
  }

  @Get(":id/stats")
  @ApiOperation({ summary: "Get project statistics" })
  @ApiResponse({ status: 200, description: "Project statistics retrieved successfully" })
  async getProjectStats(@Param("id", ParseUUIDPipe) id: string) {
    return await this.projectsService.getProjectStats(id)
  }

  @Get(":id/members")
  @ApiOperation({ summary: "Get project members" })
  @ApiResponse({ status: 200, description: "Project members retrieved successfully" })
  async getProjectMembers(@Param("id", ParseUUIDPipe) id: string) {
    return await this.projectsService.getProjectMembers(id)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update project" })
  @ApiResponse({ status: 200, description: "Project updated successfully" })
  @ApiResponse({ status: 404, description: "Project not found" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async update(@Param("id", ParseUUIDPipe) id: string, updateProjectDto: UpdateProjectDto, @CurrentUser() user: User) {
    return await this.projectsService.update(id, updateProjectDto, user.id)
  }

  @Post(":id/members")
  @ApiOperation({ summary: "Add member to project" })
  @ApiResponse({ status: 200, description: "Member added successfully" })
  @ApiResponse({ status: 404, description: "Project or user not found" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async addMember(
    @Param("id", ParseUUIDPipe) id: string,
    @Body("memberId") memberId: string,
    @CurrentUser() user: User,
  ) {
    return await this.projectsService.addMember(id, memberId, user.id)
  }

  @Delete(":id/members/:memberId")
  @ApiOperation({ summary: "Remove member from project" })
  @ApiResponse({ status: 200, description: "Member removed successfully" })
  @ApiResponse({ status: 404, description: "Project or user not found" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async removeMember(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("memberId", ParseUUIDPipe) memberId: string,
    @CurrentUser() user: User,
  ) {
    return await this.projectsService.removeMember(id, memberId, user.id)
  }

  @Patch(":id/archive")
  @ApiOperation({ summary: "Archive project" })
  @ApiResponse({ status: 200, description: "Project archived successfully" })
  @ApiResponse({ status: 404, description: "Project not found" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async archiveProject(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return await this.projectsService.archiveProject(id, user.id)
  }

  @Patch(":id/restore")
  @ApiOperation({ summary: "Restore archived project" })
  @ApiResponse({ status: 200, description: "Project restored successfully" })
  @ApiResponse({ status: 404, description: "Project not found" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async restoreProject(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return await this.projectsService.restoreProject(id, user.id)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete project" })
  @ApiResponse({ status: 200, description: "Project deleted successfully" })
  @ApiResponse({ status: 404, description: "Project not found" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async remove(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    await this.projectsService.remove(id, user.id)
    return { message: "Project deleted successfully" }
  }
}
