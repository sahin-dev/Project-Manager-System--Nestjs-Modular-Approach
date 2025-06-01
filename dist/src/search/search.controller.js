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
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let SearchController = class SearchController {
    constructor(searchService) {
        this.searchService = searchService;
    }
    async search(query, type, projectId, userId, status, priority, page = 1, limit = 10) {
        return await this.searchService.search(query, type, { projectId, userId, status, priority }, page, limit);
    }
    async autocomplete(query, limit = 10) {
        return await this.searchService.autocomplete(query, limit);
    }
    async fuzzySearch(query, maxDistance = 2) {
        return await this.searchService.fuzzySearch(query, maxDistance);
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Search across tasks, projects, and users" }),
    (0, swagger_1.ApiQuery)({ name: "q", required: true, type: String, description: "Search query" }),
    (0, swagger_1.ApiQuery)({ name: "type", required: false, enum: ["task", "project", "user"], description: "Filter by type" }),
    (0, swagger_1.ApiQuery)({ name: "projectId", required: false, type: String, description: "Filter by project ID" }),
    (0, swagger_1.ApiQuery)({ name: "userId", required: false, type: String, description: "Filter by user ID" }),
    (0, swagger_1.ApiQuery)({ name: "status", required: false, type: String, description: "Filter by status" }),
    (0, swagger_1.ApiQuery)({ name: "priority", required: false, type: String, description: "Filter by priority" }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number, description: "Page number" }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number, description: "Items per page" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Search results retrieved successfully" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "search", null);
__decorate([
    (0, common_1.Get)("autocomplete"),
    (0, swagger_1.ApiOperation)({ summary: "Get autocomplete suggestions" }),
    (0, swagger_1.ApiQuery)({ name: "q", required: true, type: String, description: "Search query prefix" }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number, description: "Maximum suggestions" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Autocomplete suggestions retrieved successfully" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "autocomplete", null);
__decorate([
    (0, common_1.Get)("fuzzy"),
    (0, swagger_1.ApiOperation)({ summary: "Fuzzy search with typo tolerance" }),
    (0, swagger_1.ApiQuery)({ name: "q", required: true, type: String, description: "Search query" }),
    (0, swagger_1.ApiQuery)({ name: "distance", required: false, type: Number, description: "Maximum edit distance" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Fuzzy search results retrieved successfully" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "fuzzySearch", null);
exports.SearchController = SearchController = __decorate([
    (0, swagger_1.ApiTags)("search"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("search"),
    __metadata("design:paramtypes", [Function])
], SearchController);
//# sourceMappingURL=search.controller.js.map