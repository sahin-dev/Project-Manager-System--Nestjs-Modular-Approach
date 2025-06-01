import type { ProjectsService } from "./projects.service";
import type { CreateProjectDto } from "./dto/create-project.dto";
import type { UpdateProjectDto } from "./dto/update-project.dto";
import type { User } from "../users/entities/user.entity";
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(createProjectDto: CreateProjectDto, user: User): Promise<import("./entities/project.entity").Project>;
    findAll(page?: number, limit?: number, isActive?: boolean, user?: User): Promise<{
        projects: import("./entities/project.entity").Project[];
        total: number;
    }>;
    getMyProjects(user: User, role?: "owner" | "member"): Promise<import("./entities/project.entity").Project[]>;
    findOne(id: string, user: User): Promise<import("./entities/project.entity").Project>;
    getProjectStats(id: string): Promise<any>;
    getProjectMembers(id: string): Promise<User[]>;
    update(id: string, updateProjectDto: UpdateProjectDto, user: User): Promise<import("./entities/project.entity").Project>;
    addMember(id: string, memberId: string, user: User): Promise<import("./entities/project.entity").Project>;
    removeMember(id: string, memberId: string, user: User): Promise<import("./entities/project.entity").Project>;
    archiveProject(id: string, user: User): Promise<import("./entities/project.entity").Project>;
    restoreProject(id: string, user: User): Promise<import("./entities/project.entity").Project>;
    remove(id: string, user: User): Promise<{
        message: string;
    }>;
}
