import type { AuthService } from "./auth.service";
import type { CreateUserDto } from "../users/dto/create-user.dto";
import type { LoginDto } from "./dto/login.dto";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(createUserDto: CreateUserDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("../common/enums/role.enum").Role;
            avatar?: string;
            bio?: string;
            skills?: string[];
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            ownedProjects?: import("../projects/entities/project.entity").Project[];
            projects?: import("../projects/entities/project.entity").Project[];
            assignedTasks?: import("../tasks/entities/task.entity").Task[];
            createdTasks?: import("../tasks/entities/task.entity").Task[];
            comments?: import("../tasks/entities/comment.entity").Comment[];
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: any;
    }>;
}
