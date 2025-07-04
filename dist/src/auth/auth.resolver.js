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
exports.AuthResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_2 = require("@nestjs/graphql");
const user_entity_1 = require("../users/entities/user.entity");
let AuthResponse = class AuthResponse {
};
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], AuthResponse.prototype, "access_token", void 0);
__decorate([
    (0, graphql_2.Field)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], AuthResponse.prototype, "user", void 0);
AuthResponse = __decorate([
    (0, graphql_2.ObjectType)()
], AuthResponse);
let AuthResolver = class AuthResolver {
    constructor(authService) {
        this.authService = authService;
    }
    async register(createUserDto) {
        return await this.authService.register(createUserDto);
    }
    async login(loginDto) {
        return await this.authService.login(loginDto);
    }
};
exports.AuthResolver = AuthResolver;
__decorate([
    (0, graphql_1.Mutation)(() => AuthResponse),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "register", null);
__decorate([
    (0, graphql_1.Mutation)(() => AuthResponse),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "login", null);
exports.AuthResolver = AuthResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [Function])
], AuthResolver);
//# sourceMappingURL=auth.resolver.js.map