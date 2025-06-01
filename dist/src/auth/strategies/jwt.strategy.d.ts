import { Strategy } from "passport-jwt";
import type { Repository } from "typeorm";
import type { User } from "../../users/entities/user.entity";
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private userRepository;
    constructor(userRepository: Repository<User>);
    validate(payload: any): Promise<User>;
}
export {};
