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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../common/enums/role.enum");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async generateProjectReport(id, format = "pdf", res) {
        const report = await this.reportsService.generateProjectReport(id, format);
        const filename = `project-report-${id}-${new Date().toISOString().split("T")[0]}`;
        await this.reportsService.streamReport(res, report, filename, format);
    }
    async generateUserReport(id, format = "pdf", res) {
        const report = await this.reportsService.generateUserReport(id, format);
        const filename = `user-report-${id}-${new Date().toISOString().split("T")[0]}`;
        await this.reportsService.streamReport(res, report, filename, format);
    }
    async generateSystemReport(format = "pdf", res) {
        const report = await this.reportsService.generateSystemReport(format);
        const filename = `system-report-${new Date().toISOString().split("T")[0]}`;
        await this.reportsService.streamReport(res, report, filename, format);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)("projects/:id"),
    (0, swagger_1.ApiOperation)({ summary: "Generate project report" }),
    (0, swagger_1.ApiQuery)({ name: "format", required: false, enum: ["pdf", "csv"], description: "Report format" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Report generated successfully" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("format")),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "generateProjectReport", null);
__decorate([
    (0, common_1.Get)("users/:id"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.PROJECT_MANAGER, role_enum_1.Role.TEAM_LEAD),
    (0, swagger_1.ApiOperation)({ summary: "Generate user performance report" }),
    (0, swagger_1.ApiQuery)({ name: "format", required: false, enum: ["pdf", "csv"] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Report generated successfully" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("format")),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "generateUserReport", null);
__decorate([
    (0, common_1.Get)("system"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: "Generate system analytics report" }),
    (0, swagger_1.ApiQuery)({ name: "format", required: false, enum: ["pdf", "csv"] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Report generated successfully" }),
    __param(0, (0, common_1.Query)("format")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "generateSystemReport", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)("reports"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("reports"),
    __metadata("design:paramtypes", [Function])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map