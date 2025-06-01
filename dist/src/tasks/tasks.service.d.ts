import type { Repository } from "typeorm";
import type { Queue } from "bull";
import type { Task } from "./entities/task.entity";
import type { Comment } from "./entities/comment.entity";
import type { User } from "../users/entities/user.entity";
import type { Project } from "../projects/entities/project.entity";
import type { CreateTaskDto } from "./dto/create-task.dto";
import type { UpdateTaskDto } from "./dto/update-task.dto";
import type { CreateCommentDto } from "./dto/create-comment.dto";
import type { TaskSchedulerService } from "./services/task-scheduler.service";
import type { DependencyResolverService } from "./services/dependency-resolver.service";
import { TaskStatus } from "../common/enums/task-status.enum";
import type { TaskPriority } from "../common/enums/task-priority.enum";
export declare class TasksService {
    private taskRepository;
    private commentRepository;
    private userRepository;
    private projectRepository;
    private notificationQueue;
    private taskSchedulerService;
    private dependencyResolverService;
    constructor(taskRepository: Repository<Task>, commentRepository: Repository<Comment>, userRepository: Repository<User>, projectRepository: Repository<Project>, notificationQueue: Queue, taskSchedulerService: TaskSchedulerService, dependencyResolverService: DependencyResolverService);
    create(createTaskDto: CreateTaskDto, creatorId: string): Promise<Task>;
    findAll(page?: number, limit?: number, filters?: {
        projectId?: string;
        assigneeId?: string;
        status?: TaskStatus;
        priority?: TaskPriority;
        creatorId?: string;
    }): Promise<{
        tasks: Task[];
        total: number;
    }>;
    findOne(id: string): Promise<Task>;
    update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task>;
    remove(id: string, userId: string): Promise<void>;
    assignTask(taskId: string, assigneeId?: string): Promise<Task>;
    addDependencies(taskId: string, dependencyIds: string[]): Promise<Task>;
    removeDependency(taskId: string, dependencyId: string): Promise<Task>;
    findPrioritized(projectId?: string): Promise<Task[]>;
    getTasksInExecutionOrder(projectId: string): Promise<Task[]>;
    addComment(taskId: string, createCommentDto: CreateCommentDto, authorId: string): Promise<Comment>;
    getTaskComments(taskId: string): Promise<Comment[]>;
    getTasksByUser(userId: string, status?: TaskStatus): Promise<Task[]>;
    getOverdueTasks(): Promise<Task[]>;
    private canUserModifyTask;
}
