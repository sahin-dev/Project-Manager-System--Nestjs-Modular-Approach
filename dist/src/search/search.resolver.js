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
exports.SearchResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const graphql_2 = require("@nestjs/graphql");
let SearchResultType = class SearchResultType {
};
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], SearchResultType.prototype, "id", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], SearchResultType.prototype, "title", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], SearchResultType.prototype, "description", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], SearchResultType.prototype, "type", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Number)
], SearchResultType.prototype, "score", void 0);
__decorate([
    (0, graphql_2.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], SearchResultType.prototype, "highlights", void 0);
SearchResultType = __decorate([
    (0, graphql_2.ObjectType)()
], SearchResultType);
let SearchResponseType = class SearchResponseType {
};
__decorate([
    (0, graphql_2.Field)(() => [SearchResultType]),
    __metadata("design:type", Array)
], SearchResponseType.prototype, "results", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], SearchResponseType.prototype, "total", void 0);
SearchResponseType = __decorate([
    (0, graphql_2.ObjectType)()
], SearchResponseType);
let AutocompleteResultType = class AutocompleteResultType {
};
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], AutocompleteResultType.prototype, "suggestion", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], AutocompleteResultType.prototype, "type", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_2.Int),
    __metadata("design:type", Number)
], AutocompleteResultType.prototype, "count", void 0);
AutocompleteResultType = __decorate([
    (0, graphql_2.ObjectType)()
], AutocompleteResultType);
let SearchResolver = class SearchResolver {
    constructor(searchService) {
        this.searchService = searchService;
    }
    async search(query, type, projectId, userId, status, priority, page, limit) {
        return await this.searchService.search(query, type, { projectId, userId, status, priority }, page, limit);
    }
    async autocomplete(query, limit) {
        return await this.searchService.autocomplete(query, limit);
    }
    async fuzzySearch(query, maxDistance) {
        return await this.searchService.fuzzySearch(query, maxDistance);
    }
};
exports.SearchResolver = SearchResolver;
__decorate([
    (0, graphql_1.Query)(() => SearchResponseType, { name: "search" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], SearchResolver.prototype, "search", null);
__decorate([
    (0, graphql_1.Query)(() => [AutocompleteResultType], { name: "autocomplete" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], SearchResolver.prototype, "autocomplete", null);
__decorate([
    (0, graphql_1.Query)(() => [SearchResultType], { name: "fuzzySearch" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], SearchResolver.prototype, "fuzzySearch", null);
exports.SearchResolver = SearchResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [Function])
], SearchResolver);
//# sourceMappingURL=search.resolver.js.map