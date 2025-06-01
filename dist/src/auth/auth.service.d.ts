import type { JwtService } from "@nestjs/jwt";
import type { Repository } from "typeorm";
import type { User } from "../users/entities/user.entity";
import type { CreateUserDto } from "../users/dto/create-user.dto";
import type { LoginDto } from "./dto/login.dto";
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: any;
    }>;
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
}
