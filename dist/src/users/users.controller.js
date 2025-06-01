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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../common/enums/role.enum");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async create(createUserDto) {
        return await this.usersService.create(createUserDto);
    }
    async findAll(page = 1, limit = 10, role) {
        return await this.usersService.findAll(page, limit, role);
    }
    async getProfile(user) {
        return await this.usersService.findOne(user.id);
    }
    async getMyStats(user) {
        return await this.usersService.getUserStats(user.id);
    }
    async findBySkills(skills) {
        const skillsArray = Array.isArray(skills) ? skills : [skills];
        return await this.usersService.getUsersBySkills(skillsArray);
    }
    async findOne(id) {
        return await this.usersService.findOne(id);
    }
    async getUserStats(id) {
        return await this.usersService.getUserStats(id);
    }
    async updateProfile(user, updateUserDto) {
        return await this.usersService.update(user.id, updateUserDto);
    }
    async update(id, updateUserDto) {
        return await this.usersService.update(id, updateUserDto);
    }
    async deactivate(id) {
        return await this.usersService.deactivate(id);
    }
    async activate(id) {
        return await this.usersService.activate(id);
    }
    async remove(id) {
        await this.usersService.remove(id);
        return { message: "User deleted successfully" };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: "Create a new user" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "User created successfully" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Bad request" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Forbidden" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all users with pagination" }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number, description: "Page number" }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number, description: "Items per page" }),
    (0, swagger_1.ApiQuery)({ name: "role", required: false, enum: role_enum_1.Role, description: "Filter by role" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Users retrieved successfully" }),
    __param(0, (0, common_1.Query)("page", new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)("limit", new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)("role")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("me"),
    (0, swagger_1.ApiOperation)({ summary: "Get current user profile" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Current user profile" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)("me/stats"),
    (0, swagger_1.ApiOperation)({ summary: "Get current user statistics" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "User statistics" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyStats", null);
__decorate([
    (0, common_1.Get)("by-skills"),
    (0, swagger_1.ApiOperation)({ summary: "Find users by skills" }),
    (0, swagger_1.ApiQuery)({ name: "skills", required: true, type: [String], description: "Array of skills" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Users with matching skills" }),
    __param(0, (0, common_1.Query)("skills")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findBySkills", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get user by ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "User found" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "User not found" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(":id/stats"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.PROJECT_MANAGER, role_enum_1.Role.TEAM_LEAD),
    (0, swagger_1.ApiOperation)({ summary: "Get user statistics by ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "User statistics" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "User not found" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserStats", null);
__decorate([
    (0, common_1.Patch)("me"),
    (0, swagger_1.ApiOperation)({ summary: "Update current user profile" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Profile updated successfully" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Bad request" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: "Update user by ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "User updated successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "User not found" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(":id/deactivate"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: "Deactivate user" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "User deactivated successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "User not found" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Patch)(":id/activate"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: "Activate user" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "User activated successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "User not found" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "activate", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "Delete user" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "User deleted successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "User not found" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)("users"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("users"),
    __metadata("design:paramtypes", [Function])
], UsersController);
//# sourceMappingURL=users.controller.js.map