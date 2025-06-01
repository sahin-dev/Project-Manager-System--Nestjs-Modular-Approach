import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"
import type { UsersService } from "./users.service"
import type { CreateUserDto } from "./dto/create-user.dto"
import type { UpdateUserDto } from "./dto/update-user.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { Role } from "../common/enums/role.enum"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import type { User } from "./entities/user.entity"

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({ status: 201, description: "User created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async create(createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto)
  }

  @Get()
  @ApiOperation({ summary: "Get all users with pagination" })
  @ApiQuery({ name: "page", required: false, type: Number, description: "Page number" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Items per page" })
  @ApiQuery({ name: "role", required: false, enum: Role, description: "Filter by role" })
  @ApiResponse({ status: 200, description: "Users retrieved successfully" })
  async findAll(
    @Query("page", new ParseIntPipe({ optional: true })) page = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 10,
    @Query("role") role?: Role,
  ) {
    return await this.usersService.findAll(page, limit, role)
  }

  @Get("me")
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "Current user profile" })
  async getProfile(@CurrentUser() user: User) {
    return await this.usersService.findOne(user.id)
  }

  @Get("me/stats")
  @ApiOperation({ summary: "Get current user statistics" })
  @ApiResponse({ status: 200, description: "User statistics" })
  async getMyStats(@CurrentUser() user: User) {
    return await this.usersService.getUserStats(user.id)
  }

  @Get("by-skills")
  @ApiOperation({ summary: "Find users by skills" })
  @ApiQuery({ name: "skills", required: true, type: [String], description: "Array of skills" })
  @ApiResponse({ status: 200, description: "Users with matching skills" })
  async findBySkills(@Query("skills") skills: string | string[]) {
    const skillsArray = Array.isArray(skills) ? skills : [skills]
    return await this.usersService.getUsersBySkills(skillsArray)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  @ApiResponse({ status: 200, description: "User found" })
  @ApiResponse({ status: 404, description: "User not found" })
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    return await this.usersService.findOne(id)
  }

  @Get(":id/stats")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.TEAM_LEAD)
  @ApiOperation({ summary: "Get user statistics by ID" })
  @ApiResponse({ status: 200, description: "User statistics" })
  @ApiResponse({ status: 404, description: "User not found" })
  async getUserStats(@Param("id", ParseUUIDPipe) id: string) {
    return await this.usersService.getUserStats(id)
  }

  @Patch("me")
  @ApiOperation({ summary: "Update current user profile" })
  @ApiResponse({ status: 200, description: "Profile updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async updateProfile(@CurrentUser() user: User, updateUserDto: UpdateUserDto) {
    return await this.usersService.update(user.id, updateUserDto)
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @ApiOperation({ summary: "Update user by ID" })
  @ApiResponse({ status: 200, description: "User updated successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async update(@Param("id", ParseUUIDPipe) id: string, updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto)
  }

  @Patch(":id/deactivate")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @ApiOperation({ summary: "Deactivate user" })
  @ApiResponse({ status: 200, description: "User deactivated successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async deactivate(@Param("id", ParseUUIDPipe) id: string) {
    return await this.usersService.deactivate(id)
  }

  @Patch(":id/activate")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @ApiOperation({ summary: "Activate user" })
  @ApiResponse({ status: 200, description: "User activated successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async activate(@Param("id", ParseUUIDPipe) id: string) {
    return await this.usersService.activate(id)
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Delete user" })
  @ApiResponse({ status: 200, description: "User deleted successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    await this.usersService.remove(id)
    return { message: "User deleted successfully" }
  }
}
