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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const project_entity_1 = require("./entities/project.entity");
const user_entity_1 = require("../users/entities/user.entity");
const role_enum_1 = require("../common/enums/role.enum");
const typeorm_1 = require("@nestjs/typeorm");
let ProjectsService = class ProjectsService {
    constructor(projectRepository, userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }
    async create(createProjectDto, ownerId) {
        const owner = await this.userRepository.findOne({ where: { id: ownerId } });
        if (!owner) {
            throw new common_1.NotFoundException("Owner not found");
        }
        if (![role_enum_1.Role.ADMIN, role_enum_1.Role.PROJECT_MANAGER, role_enum_1.Role.TEAM_LEAD].includes(owner.role)) {
            throw new common_1.ForbiddenException("You don't have permission to create projects");
        }
        const project = this.projectRepository.create({
            ...createProjectDto,
            owner,
            members: [owner],
        });
        return await this.projectRepository.save(project);
    }
    async findAll(page = 1, limit = 10, userId, isActive) {
        const queryBuilder = this.projectRepository
            .createQueryBuilder("project")
            .leftJoinAndSelect("project.owner", "owner")
            .leftJoinAndSelect("project.members", "members")
            .leftJoinAndSelect("project.tasks", "tasks")
            .orderBy("project.createdAt", "DESC");
        if (userId) {
            queryBuilder.andWhere("(owner.id = :userId OR members.id = :userId)", { userId });
        }
        if (isActive !== undefined) {
            queryBuilder.andWhere("project.isActive = :isActive", { isActive });
        }
        const [projects, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { projects, total };
    }
    async findOne(id, userId) {
        const project = await this.projectRepository.findOne({
            where: { id },
            relations: ["owner", "members", "tasks", "tasks.assignee", "tasks.creator"],
        });
        if (!project) {
            throw new common_1.NotFoundException("Project not found");
        }
        if (userId) {
            const hasAccess = this.userHasProjectAccess(project, userId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException("You don't have access to this project");
            }
        }
        return project;
    }
    async update(id, updateProjectDto, userId) {
        const project = await this.findOne(id);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        const canUpdate = this.canUserModifyProject(project, user);
        if (!canUpdate) {
            throw new common_1.ForbiddenException("You don't have permission to update this project");
        }
        await this.projectRepository.update(id, updateProjectDto);
        return await this.findOne(id);
    }
    async remove(id, userId) {
        const project = await this.findOne(id);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        if (project.owner.id !== userId && user.role !== role_enum_1.Role.ADMIN) {
            throw new common_1.ForbiddenException("You don't have permission to delete this project");
        }
        await this.projectRepository.remove(project);
    }
    async addMember(projectId, memberId, requesterId) {
        const project = await this.findOne(projectId);
        const member = await this.userRepository.findOne({ where: { id: memberId } });
        const requester = await this.userRepository.findOne({ where: { id: requesterId } });
        if (!member) {
            throw new common_1.NotFoundException("Member not found");
        }
        if (!requester) {
            throw new common_1.NotFoundException("Requester not found");
        }
        const canAddMembers = this.canUserModifyProject(project, requester);
        if (!canAddMembers) {
            throw new common_1.ForbiddenException("You don't have permission to add members to this project");
        }
        const isAlreadyMember = project.members.some((m) => m.id === memberId);
        if (isAlreadyMember) {
            throw new common_1.BadRequestException("User is already a member of this project");
        }
        project.members.push(member);
        await this.projectRepository.save(project);
        return await this.findOne(projectId);
    }
    async removeMember(projectId, memberId, requesterId) {
        const project = await this.findOne(projectId);
        const requester = await this.userRepository.findOne({ where: { id: requesterId } });
        if (!requester) {
            throw new common_1.NotFoundException("Requester not found");
        }
        const canRemoveMembers = this.canUserModifyProject(project, requester);
        if (!canRemoveMembers) {
            throw new common_1.ForbiddenException("You don't have permission to remove members from this project");
        }
        if (project.owner.id === memberId) {
            throw new common_1.BadRequestException("Cannot remove project owner from the project");
        }
        project.members = project.members.filter((member) => member.id !== memberId);
        await this.projectRepository.save(project);
        return await this.findOne(projectId);
    }
    async getProjectMembers(projectId) {
        const project = await this.findOne(projectId);
        return project.members;
    }
    async getProjectStats(projectId) {
        const project = await this.findOne(projectId);
        const stats = await this.projectRepository
            .createQueryBuilder("project")
            .leftJoin("project.tasks", "task")
            .select([
            "COUNT(DISTINCT task.id) as totalTasks",
            "COUNT(DISTINCT CASE WHEN task.status = 'done' THEN task.id END) as completedTasks",
            "COUNT(DISTINCT CASE WHEN task.status = 'in_progress' THEN task.id END) as inProgressTasks",
            "COUNT(DISTINCT CASE WHEN task.status = 'todo' THEN task.id END) as todoTasks",
            "COUNT(DISTINCT CASE WHEN task.status = 'blocked' THEN task.id END) as blockedTasks",
            "AVG(task.actualHours) as avgTaskHours",
            "SUM(task.estimatedHours) as totalEstimatedHours",
            "SUM(task.actualHours) as totalActualHours",
        ])
            .where("project.id = :projectId", { projectId })
            .getRawOne();
        const totalTasks = Number.parseInt(stats.totalTasks) || 0;
        const completedTasks = Number.parseInt(stats.completedTasks) || 0;
        return {
            project,
            stats: {
                totalTasks,
                completedTasks,
                inProgressTasks: Number.parseInt(stats.inProgressTasks) || 0,
                todoTasks: Number.parseInt(stats.todoTasks) || 0,
                blockedTasks: Number.parseInt(stats.blockedTasks) || 0,
                completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
                averageTaskHours: Number.parseFloat(stats.avgTaskHours) || 0,
                totalEstimatedHours: Number.parseFloat(stats.totalEstimatedHours) || 0,
                totalActualHours: Number.parseFloat(stats.totalActualHours) || 0,
                estimationAccuracy: stats.totalEstimatedHours > 0 && stats.totalActualHours > 0
                    ? (Math.min(stats.totalEstimatedHours, stats.totalActualHours) /
                        Math.max(stats.totalEstimatedHours, stats.totalActualHours)) *
                        100
                    : 0,
            },
        };
    }
    async getUserProjects(userId, role) {
        const queryBuilder = this.projectRepository
            .createQueryBuilder("project")
            .leftJoinAndSelect("project.owner", "owner")
            .leftJoinAndSelect("project.members", "members")
            .where("project.isActive = :isActive", { isActive: true });
        if (role === "owner") {
            queryBuilder.andWhere("owner.id = :userId", { userId });
        }
        else if (role === "member") {
            queryBuilder.andWhere("members.id = :userId", { userId });
        }
        else {
            queryBuilder.andWhere("(owner.id = :userId OR members.id = :userId)", { userId });
        }
        return await queryBuilder.orderBy("project.createdAt", "DESC").getMany();
    }
    async archiveProject(projectId, userId) {
        const project = await this.findOne(projectId);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        const canArchive = this.canUserModifyProject(project, user);
        if (!canArchive) {
            throw new common_1.ForbiddenException("You don't have permission to archive this project");
        }
        await this.projectRepository.update(projectId, { isActive: false });
        return await this.findOne(projectId);
    }
    async restoreProject(projectId, userId) {
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
            relations: ["owner", "members"],
        });
        if (!project) {
            throw new common_1.NotFoundException("Project not found");
        }
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        const canRestore = this.canUserModifyProject(project, user);
        if (!canRestore) {
            throw new common_1.ForbiddenException("You don't have permission to restore this project");
        }
        await this.projectRepository.update(projectId, { isActive: true });
        return await this.findOne(projectId);
    }
    userHasProjectAccess(project, userId) {
        return project.owner.id === userId || project.members.some((member) => member.id === userId);
    }
    canUserModifyProject(project, user) {
        if (user.role === role_enum_1.Role.ADMIN || user.role === role_enum_1.Role.PROJECT_MANAGER) {
            return true;
        }
        if (project.owner.id === user.id) {
            return true;
        }
        if (user.role === role_enum_1.Role.TEAM_LEAD && project.members.some((member) => member.id === user.id)) {
            return true;
        }
        return false;
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [Function, Function])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map