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
exports.TaskSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const task_priority_enum_1 = require("../../common/enums/task-priority.enum");
const task_status_enum_1 = require("../../common/enums/task-status.enum");
let TaskSchedulerService = class TaskSchedulerService {
    constructor(taskRepository, userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }
    async assignOptimalUser(taskId) {
        const task = await this.taskRepository.findOne({
            where: { id: taskId },
            relations: ["project", "project.members"],
        });
        if (!task || !task.project?.members) {
            return null;
        }
        const availableUsers = task.project.members.filter((user) => user.isActive);
        const scores = [];
        for (const user of availableUsers) {
            const score = await this.calculateAssignmentScore(user, task);
            scores.push({ user, score, task });
        }
        scores.sort((a, b) => b.score - a.score);
        return scores.length > 0 ? scores[0].user : null;
    }
    async calculateAssignmentScore(user, task) {
        let score = 0;
        const skillMatch = this.calculateSkillMatch(user.skills || [], task.tags || []);
        score += skillMatch * 0.4;
        const currentWorkload = await this.getCurrentWorkload(user.id);
        const workloadScore = Math.max(0, 1 - currentWorkload / 10);
        score += workloadScore * 0.3;
        const priorityScore = this.getPriorityScore(task.priority);
        score += priorityScore * 0.2;
        const availabilityScore = user.isActive ? 1 : 0;
        score += availabilityScore * 0.1;
        return score;
    }
    calculateSkillMatch(userSkills, taskTags) {
        if (taskTags.length === 0)
            return 0.5;
        const matchingSkills = userSkills.filter((skill) => taskTags.some((tag) => tag.toLowerCase().includes(skill.toLowerCase())));
        return matchingSkills.length / taskTags.length;
    }
    async getCurrentWorkload(userId) {
        return await this.taskRepository.count({
            where: {
                assignee: { id: userId },
                status: task_status_enum_1.TaskStatus.IN_PROGRESS,
            },
        });
    }
    getPriorityScore(priority) {
        const priorityMap = {
            [task_priority_enum_1.TaskPriority.CRITICAL]: 1.0,
            [task_priority_enum_1.TaskPriority.HIGH]: 0.8,
            [task_priority_enum_1.TaskPriority.MEDIUM]: 0.6,
            [task_priority_enum_1.TaskPriority.LOW]: 0.4,
        };
        return priorityMap[priority] || 0.5;
    }
    async getPrioritizedTasks(projectId) {
        const queryBuilder = this.taskRepository
            .createQueryBuilder("task")
            .leftJoinAndSelect("task.assignee", "assignee")
            .leftJoinAndSelect("task.project", "project")
            .where("task.status != :status", { status: "done" });
        if (projectId) {
            queryBuilder.andWhere("task.project.id = :projectId", { projectId });
        }
        const tasks = await queryBuilder.getMany();
        return tasks.sort((a, b) => {
            const priorityOrder = {
                [task_priority_enum_1.TaskPriority.CRITICAL]: 4,
                [task_priority_enum_1.TaskPriority.HIGH]: 3,
                [task_priority_enum_1.TaskPriority.MEDIUM]: 2,
                [task_priority_enum_1.TaskPriority.LOW]: 1,
            };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0)
                return priorityDiff;
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            if (a.dueDate)
                return -1;
            if (b.dueDate)
                return 1;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
    }
};
exports.TaskSchedulerService = TaskSchedulerService;
exports.TaskSchedulerService = TaskSchedulerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Function, Function])
], TaskSchedulerService);
//# sourceMappingURL=task-scheduler.service.js.map