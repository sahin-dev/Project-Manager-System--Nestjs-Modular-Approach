import { User } from "../../users/entities/user.entity";
import { Task } from "./task.entity";
export declare class Comment {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    author: User;
    task: Task;
}
