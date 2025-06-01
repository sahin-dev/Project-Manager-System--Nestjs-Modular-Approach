import type { Repository } from "typeorm";
import { Project } from "./entities/project.entity";
import { User } from "../users/entities/user.entity";
import type { CreateProjectDto } from "./dto/create-project.dto";
import type { UpdateProjectDto } from "./dto/update-project.dto";
export declare class ProjectsService {
    private projectRepository;
    private userRepository;
    constructor(projectRepository: Repository<Project>, userRepository: Repository<User>);
    create(createProjectDto: CreateProjectDto, ownerId: string): Promise<Project>;
    findAll(page?: number, limit?: number, userId?: string, isActive?: boolean): Promise<{
        projects: Project[];
        total: number;
    }>;
    findOne(id: string, userId?: string): Promise<Project>;
    update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<Project>;
    remove(id: string, userId: string): Promise<void>;
    addMember(projectId: string, memberId: string, requesterId: string): Promise<Project>;
    removeMember(projectId: string, memberId: string, requesterId: string): Promise<Project>;
    getProjectMembers(projectId: string): Promise<User[]>;
    getProjectStats(projectId: string): Promise<any>;
    getUserProjects(userId: string, role?: "owner" | "member"): Promise<Project[]>;
    archiveProject(projectId: string, userId: string): Promise<Project>;
    restoreProject(projectId: string, userId: string): Promise<Project>;
    private userHasProjectAccess;
    private canUserModifyProject;
}
