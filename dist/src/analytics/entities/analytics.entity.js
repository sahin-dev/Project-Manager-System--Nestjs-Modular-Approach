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
exports.Analytics = exports.AnalyticsEventType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const project_entity_1 = require("../../projects/entities/project.entity");
var AnalyticsEventType;
(function (AnalyticsEventType) {
    AnalyticsEventType["USER_LOGIN"] = "user_login";
    AnalyticsEventType["USER_LOGOUT"] = "user_logout";
    AnalyticsEventType["TASK_CREATED"] = "task_created";
    AnalyticsEventType["TASK_UPDATED"] = "task_updated";
    AnalyticsEventType["TASK_COMPLETED"] = "task_completed";
    AnalyticsEventType["TASK_DELETED"] = "task_deleted";
    AnalyticsEventType["PROJECT_CREATED"] = "project_created";
    AnalyticsEventType["PROJECT_UPDATED"] = "project_updated";
    AnalyticsEventType["PROJECT_COMPLETED"] = "project_completed";
    AnalyticsEventType["TIME_LOGGED"] = "time_logged";
    AnalyticsEventType["COMMENT_ADDED"] = "comment_added";
    AnalyticsEventType["FILE_UPLOADED"] = "file_uploaded";
    AnalyticsEventType["NOTIFICATION_SENT"] = "notification_sent";
    AnalyticsEventType["SEARCH_PERFORMED"] = "search_performed";
})(AnalyticsEventType || (exports.AnalyticsEventType = AnalyticsEventType = {}));
let Analytics = class Analytics {
};
exports.Analytics = Analytics;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Analytics.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: AnalyticsEventType,
    }),
    __metadata("design:type", String)
], Analytics.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb"),
    __metadata("design:type", Object)
], Analytics.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: "SET NULL" }),
    __metadata("design:type", user_entity_1.User)
], Analytics.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: true, onDelete: "SET NULL" }),
    __metadata("design:type", project_entity_1.Project)
], Analytics.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Analytics.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Analytics.prototype, "updatedAt", void 0);
exports.Analytics = Analytics = __decorate([
    (0, typeorm_1.Entity)("analytics")
], Analytics);
//# sourceMappingURL=analytics.entity.js.map