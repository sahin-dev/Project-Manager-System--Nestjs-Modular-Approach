import type { TasksService } from "./tasks.service";
import type { CreateTaskDto } from "./dto/create-task.dto";
import type { UpdateTaskDto } from "./dto/update-task.dto";
import type { CreateCommentDto } from "./dto/create-comment.dto";
import type { User } from "../users/entities/user.entity";
import { TaskStatus } from "../common/enums/task-status.enum";
import { TaskPriority } from "../common/enums/task-priority.enum";
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto, user: User): Promise<import("./entities/task.entity").Task>;
    findAll(page?: number, limit?: number, projectId?: string, assigneeId?: string, status?: TaskStatus, priority?: TaskPriority, creatorId?: string): Promise<{
        tasks: import("./entities/task.entity").Task[];
        total: number;
    }>;
    findPrioritized(projectId?: string): Promise<import("./entities/task.entity").Task[]>;
    getOverdueTasks(): Promise<import("./entities/task.entity").Task[]>;
    getMyTasks(user: User, status?: TaskStatus): Promise<import("./entities/task.entity").Task[]>;
    getExecutionOrder(projectId: string): Promise<import("./entities/task.entity").Task[]>;
    findOne(id: string): Promise<import("./entities/task.entity").Task>;
    getComments(id: string): Promise<import("./entities/comment.entity").Comment[]>;
    update(id: string, updateTaskDto: UpdateTaskDto, user: User): Promise<import("./entities/task.entity").Task>;
    assignTask(id: string, assigneeId?: string): Promise<import("./entities/task.entity").Task>;
    addDependencies(id: string, dependencyIds: string[]): Promise<import("./entities/task.entity").Task>;
    removeDependency(id: string, dependencyId: string): Promise<import("./entities/task.entity").Task>;
    addComment(id: string, createCommentDto: CreateCommentDto, user: User): Promise<import("./entities/comment.entity").Comment>;
    remove(id: string, user: User): Promise<{
        message: string;
    }>;
}
