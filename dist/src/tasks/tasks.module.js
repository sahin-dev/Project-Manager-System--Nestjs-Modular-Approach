"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const tasks_service_1 = require("./tasks.service");
const tasks_controller_1 = require("./tasks.controller");
const task_scheduler_service_1 = require("./services/task-scheduler.service");
const dependency_resolver_service_1 = require("./services/dependency-resolver.service");
const task_entity_1 = require("./entities/task.entity");
const comment_entity_1 = require("./entities/comment.entity");
const user_entity_1 = require("../users/entities/user.entity");
const project_entity_1 = require("../projects/entities/project.entity");
const notifications_module_1 = require("../notifications/notifications.module");
let TasksModule = class TasksModule {
};
exports.TasksModule = TasksModule;
exports.TasksModule = TasksModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([task_entity_1.Task, comment_entity_1.Comment, user_entity_1.User, project_entity_1.Project]),
            bull_1.BullModule.registerQueue({
                name: "task-notifications",
            }),
            notifications_module_1.NotificationsModule,
        ],
        providers: [tasks_service_1.TasksService, task_scheduler_service_1.TaskSchedulerService, dependency_resolver_service_1.DependencyResolverService],
        controllers: [tasks_controller_1.TasksController],
        exports: [tasks_service_1.TasksService, task_scheduler_service_1.TaskSchedulerService, dependency_resolver_service_1.DependencyResolverService],
    })
], TasksModule);
//# sourceMappingURL=tasks.module.js.map