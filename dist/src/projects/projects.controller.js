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
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let ProjectsController = class ProjectsController {
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    async create(createProjectDto, user) {
        return await this.projectsService.create(createProjectDto, user.id);
    }
    async findAll(page = 1, limit = 10, isActive, user) {
        return await this.projectsService.findAll(page, limit, user?.id, isActive);
    }
    async getMyProjects(user, role) {
        return await this.projectsService.getUserProjects(user.id, role);
    }
    async findOne(id, user) {
        return await this.projectsService.findOne(id, user.id);
    }
    async getProjectStats(id) {
        return await this.projectsService.getProjectStats(id);
    }
    async getProjectMembers(id) {
        return await this.projectsService.getProjectMembers(id);
    }
    async update(id, updateProjectDto, user) {
        return await this.projectsService.update(id, updateProjectDto, user.id);
    }
    async addMember(id, memberId, user) {
        return await this.projectsService.addMember(id, memberId, user.id);
    }
    async removeMember(id, memberId, user) {
        return await this.projectsService.removeMember(id, memberId, user.id);
    }
    async archiveProject(id, user) {
        return await this.projectsService.archiveProject(id, user.id);
    }
    async restoreProject(id, user) {
        return await this.projectsService.restoreProject(id, user.id);
    }
    async remove(id, user) {
        await this.projectsService.remove(id, user.id);
        return { message: "Project deleted successfully" };
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Create a new project" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Project created successfully" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Forbidden" }),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Function]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all projects with pagination and filters" }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "isActive", required: false, type: Boolean }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Projects retrieved successfully" }),
    __param(0, (0, common_1.Query)("page", new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)("limit", new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)("isActive", new common_1.ParseBoolPipe({ optional: true }))),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Boolean, Function]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("my-projects"),
    (0, swagger_1.ApiOperation)({ summary: "Get current user's projects" }),
    (0, swagger_1.ApiQuery)({ name: "role", required: false, enum: ["owner", "member"] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "User projects retrieved successfully" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)("role")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getMyProjects", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get project by ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Project found" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Project not found" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Forbidden" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(":id/stats"),
    (0, swagger_1.ApiOperation)({ summary: "Get project statistics" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Project statistics retrieved successfully" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getProjectStats", null);
__decorate([
    (0, common_1.Get)(":id/members"),
    (0, swagger_1.ApiOperation)({ summary: "Get project members" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Project members retrieved successfully" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getProjectMembers", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Update project" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Project updated successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Project not found" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Forbidden" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function, Function]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(":id/members"),
    (0, swagger_1.ApiOperation)({ summary: "Add member to project" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Member added successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Project or user not found" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Forbidden" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)("memberId")),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Function]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "addMember", null);
__decorate([
    (0, common_1.Delete)(":id/members/:memberId"),
    (0, swagger_1.ApiOperation)({ summary: "Remove member from project" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Member removed successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Project or user not found" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Forbidden" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)("memberId", common_1.ParseUUIDPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Function]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Patch)(":id/archive"),
    (0, swagger_1.ApiOperation)({ summary: "Archive project" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Project archived successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Project not found" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Forbidden" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "archiveProject", null);
__decorate([
    (0, common_1.Patch)(":id/restore"),
    (0, swagger_1.ApiOperation)({ summary: "Restore archived project" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Project restored successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Project not found" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Forbidden" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "restoreProject", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Delete project" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Project deleted successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Project not found" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Forbidden" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "remove", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, swagger_1.ApiTags)("projects"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("projects"),
    __metadata("design:paramtypes", [Function])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map