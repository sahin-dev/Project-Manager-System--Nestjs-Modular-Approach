import { TaskStatus } from "../../common/enums/task-status.enum";
import { TaskPriority } from "../../common/enums/task-priority.enum";
import { User } from "../../users/entities/user.entity";
import { Project } from "../../projects/entities/project.entity";
import { Comment } from "./comment.entity";
export declare class Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    estimatedHours: number;
    actualHours: number;
    dueDate?: Date;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
    project: Project;
    creator: User;
    assignee?: User;
    dependencies?: Task[];
    blockedBy?: Task[];
    comments?: Comment[];
}
