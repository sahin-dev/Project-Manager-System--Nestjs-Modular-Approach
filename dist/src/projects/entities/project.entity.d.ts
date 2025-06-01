import { User } from "../../users/entities/user.entity";
import { Task } from "../../tasks/entities/task.entity";
export declare class Project {
    id: string;
    name: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    owner: User;
    members: User[];
    tasks?: Task[];
}
