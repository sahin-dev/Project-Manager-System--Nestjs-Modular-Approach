import { Role } from "../../common/enums/role.enum";
export declare class CreateUserDto {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role?: Role;
    avatar?: string;
    bio?: string;
    skills?: string[];
}
