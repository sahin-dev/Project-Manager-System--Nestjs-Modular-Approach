import type { UsersService } from "./users.service";
import type { CreateUserDto } from "./dto/create-user.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";
import { Role } from "../common/enums/role.enum";
import type { User } from "./entities/user.entity";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(page?: number, limit?: number, role?: Role): Promise<{
        users: User[];
        total: number;
    }>;
    getProfile(user: User): Promise<User>;
    getMyStats(user: User): Promise<any>;
    findBySkills(skills: string | string[]): Promise<User[]>;
    findOne(id: string): Promise<User>;
    getUserStats(id: string): Promise<any>;
    updateProfile(user: User, updateUserDto: UpdateUserDto): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    deactivate(id: string): Promise<User>;
    activate(id: string): Promise<User>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
