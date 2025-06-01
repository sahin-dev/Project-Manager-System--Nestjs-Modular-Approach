import type { Repository } from "typeorm";
import type { Task } from "../entities/task.entity";
export declare class DependencyResolverService {
    private taskRepository;
    constructor(taskRepository: Repository<Task>);
    validateAndResolveDependencies(taskId: string, dependencyIds: string[]): Promise<boolean>;
    private detectCircularDependency;
    private hasCycleDFS;
    private buildAdjacencyList;
    getTasksInExecutionOrder(projectId: string): Promise<Task[]>;
}
