import { Role } from "../../common/enums/role.enum";
import { Project } from "../../projects/entities/project.entity";
import { Task } from "../../tasks/entities/task.entity";
import { Comment } from "../../tasks/entities/comment.entity";
export declare class User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: Role;
    avatar?: string;
    bio?: string;
    skills?: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    ownedProjects?: Project[];
    projects?: Project[];
    assignedTasks?: Task[];
    createdTasks?: Task[];
    comments?: Comment[];
}
