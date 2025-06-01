import type { Repository } from "typeorm";
import type { Task } from "../entities/task.entity";
import type { User } from "../../users/entities/user.entity";
export declare class TaskSchedulerService {
    private taskRepository;
    private userRepository;
    constructor(taskRepository: Repository<Task>, userRepository: Repository<User>);
    assignOptimalUser(taskId: string): Promise<User | null>;
    private calculateAssignmentScore;
    private calculateSkillMatch;
    private getCurrentWorkload;
    private getPriorityScore;
    getPrioritizedTasks(projectId?: string): Promise<Task[]>;
}
