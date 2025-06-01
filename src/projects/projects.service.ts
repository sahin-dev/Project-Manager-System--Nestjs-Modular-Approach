import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { Project } from "./entities/project.entity"
import { User } from "../users/entities/user.entity"
import type { CreateProjectDto } from "./dto/create-project.dto"
import type { UpdateProjectDto } from "./dto/update-project.dto"
import { Role } from "../common/enums/role.enum"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class ProjectsService {
  constructor(@InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createProjectDto: CreateProjectDto, ownerId: string): Promise<Project> {
    const owner = await this.userRepository.findOne({ where: { id: ownerId } })
    if (!owner) {
      throw new NotFoundException("Owner not found")
    }

    // Check if user can create projects
    if (![Role.ADMIN, Role.PROJECT_MANAGER, Role.TEAM_LEAD].includes(owner.role)) {
      throw new ForbiddenException("You don't have permission to create projects")
    }

    const project = this.projectRepository.create({
      ...createProjectDto,
      owner,
      members: [owner], // Owner is automatically a member
    })

    return await this.projectRepository.save(project)
  }

  async findAll(
    page = 1,
    limit = 10,
    userId?: string,
    isActive?: boolean,
  ): Promise<{ projects: Project[]; total: number }> {
    const queryBuilder = this.projectRepository
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.owner", "owner")
      .leftJoinAndSelect("project.members", "members")
      .leftJoinAndSelect("project.tasks", "tasks")
      .orderBy("project.createdAt", "DESC")

    if (userId) {
      queryBuilder.andWhere("(owner.id = :userId OR members.id = :userId)", { userId })
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere("project.isActive = :isActive", { isActive })
    }

    const [projects, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return { projects, total }
  }

  async findOne(id: string, userId?: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ["owner", "members", "tasks", "tasks.assignee", "tasks.creator"],
    })

    if (!project) {
      throw new NotFoundException("Project not found")
    }

    // Check if user has access to this project
    if (userId) {
      const hasAccess = this.userHasProjectAccess(project, userId)
      if (!hasAccess) {
        throw new ForbiddenException("You don't have access to this project")
      }
    }

    return project
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<Project> {
    const project = await this.findOne(id)
    const user = await this.userRepository.findOne({ where: { id: userId } })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    // Check permissions
    const canUpdate = this.canUserModifyProject(project, user)
    if (!canUpdate) {
      throw new ForbiddenException("You don't have permission to update this project")
    }

    await this.projectRepository.update(id, updateProjectDto)
    return await this.findOne(id)
  }

  async remove(id: string, userId: string): Promise<void> {
    const project = await this.findOne(id)
    const user = await this.userRepository.findOne({ where: { id: userId } })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    // Only project owner or admin can delete
    if (project.owner.id !== userId && user.role !== Role.ADMIN) {
      throw new ForbiddenException("You don't have permission to delete this project")
    }

    await this.projectRepository.remove(project)
  }

  async addMember(projectId: string, memberId: string, requesterId: string): Promise<Project> {
    const project = await this.findOne(projectId)
    const member = await this.userRepository.findOne({ where: { id: memberId } })
    const requester = await this.userRepository.findOne({ where: { id: requesterId } })

    if (!member) {
      throw new NotFoundException("Member not found")
    }

    if (!requester) {
      throw new NotFoundException("Requester not found")
    }

    // Check permissions
    const canAddMembers = this.canUserModifyProject(project, requester)
    if (!canAddMembers) {
      throw new ForbiddenException("You don't have permission to add members to this project")
    }

    // Check if user is already a member
    const isAlreadyMember = project.members.some((m) => m.id === memberId)
    if (isAlreadyMember) {
      throw new BadRequestException("User is already a member of this project")
    }

    project.members.push(member)
    await this.projectRepository.save(project)

    return await this.findOne(projectId)
  }

  async removeMember(projectId: string, memberId: string, requesterId: string): Promise<Project> {
    const project = await this.findOne(projectId)
    const requester = await this.userRepository.findOne({ where: { id: requesterId } })

    if (!requester) {
      throw new NotFoundException("Requester not found")
    }

    // Check permissions
    const canRemoveMembers = this.canUserModifyProject(project, requester)
    if (!canRemoveMembers) {
      throw new ForbiddenException("You don't have permission to remove members from this project")
    }

    // Cannot remove the project owner
    if (project.owner.id === memberId) {
      throw new BadRequestException("Cannot remove project owner from the project")
    }

    project.members = project.members.filter((member) => member.id !== memberId)
    await this.projectRepository.save(project)

    return await this.findOne(projectId)
  }

  async getProjectMembers(projectId: string): Promise<User[]> {
    const project = await this.findOne(projectId)
    return project.members
  }

  async getProjectStats(projectId: string): Promise<any> {
    const project = await this.findOne(projectId)

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
      .getRawOne()

    const totalTasks = Number.parseInt(stats.totalTasks) || 0
    const completedTasks = Number.parseInt(stats.completedTasks) || 0

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
        estimationAccuracy:
          stats.totalEstimatedHours > 0 && stats.totalActualHours > 0
            ? (Math.min(stats.totalEstimatedHours, stats.totalActualHours) /
                Math.max(stats.totalEstimatedHours, stats.totalActualHours)) *
              100
            : 0,
      },
    }
  }

  async getUserProjects(userId: string, role?: "owner" | "member"): Promise<Project[]> {
    const queryBuilder = this.projectRepository
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.owner", "owner")
      .leftJoinAndSelect("project.members", "members")
      .where("project.isActive = :isActive", { isActive: true })

    if (role === "owner") {
      queryBuilder.andWhere("owner.id = :userId", { userId })
    } else if (role === "member") {
      queryBuilder.andWhere("members.id = :userId", { userId })
    } else {
      queryBuilder.andWhere("(owner.id = :userId OR members.id = :userId)", { userId })
    }

    return await queryBuilder.orderBy("project.createdAt", "DESC").getMany()
  }

  async archiveProject(projectId: string, userId: string): Promise<Project> {
    const project = await this.findOne(projectId)
    const user = await this.userRepository.findOne({ where: { id: userId } })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    const canArchive = this.canUserModifyProject(project, user)
    if (!canArchive) {
      throw new ForbiddenException("You don't have permission to archive this project")
    }

    await this.projectRepository.update(projectId, { isActive: false })
    return await this.findOne(projectId)
  }

  async restoreProject(projectId: string, userId: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ["owner", "members"],
    })

    if (!project) {
      throw new NotFoundException("Project not found")
    }

    const user = await this.userRepository.findOne({ where: { id: userId } })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    const canRestore = this.canUserModifyProject(project, user)
    if (!canRestore) {
      throw new ForbiddenException("You don't have permission to restore this project")
    }

    await this.projectRepository.update(projectId, { isActive: true })
    return await this.findOne(projectId)
  }

  private userHasProjectAccess(project: Project, userId: string): boolean {
    return project.owner.id === userId || project.members.some((member) => member.id === userId)
  }

  private canUserModifyProject(project: Project, user: User): boolean {
    // Admin and project managers can modify any project
    if (user.role === Role.ADMIN || user.role === Role.PROJECT_MANAGER) {
      return true
    }

    // Project owner can modify their project
    if (project.owner.id === user.id) {
      return true
    }

    // Team leads can modify projects they're members of
    if (user.role === Role.TEAM_LEAD && project.members.some((member) => member.id === user.id)) {
      return true
    }

    return false
  }
}
