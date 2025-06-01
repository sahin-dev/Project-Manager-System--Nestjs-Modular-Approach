import type { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import type { CreateUserDto } from "./dto/create-user.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";
import type { Role } from "../common/enums/role.enum";
export declare class UsersService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(page?: number, limit?: number, role?: Role): Promise<{
        users: User[];
        total: number;
    }>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
    deactivate(id: string): Promise<User>;
    activate(id: string): Promise<User>;
    getUsersBySkills(skills: string[]): Promise<User[]>;
    getUserStats(id: string): Promise<any>;
}
