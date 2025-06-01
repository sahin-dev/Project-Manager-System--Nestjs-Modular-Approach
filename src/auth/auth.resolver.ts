import { Resolver, Mutation } from "@nestjs/graphql"
import type { AuthService } from "./auth.service"
import type { CreateUserDto } from "../users/dto/create-user.dto"
import type { LoginDto } from "./dto/login.dto"
import { ObjectType, Field } from "@nestjs/graphql"
import { User } from "../users/entities/user.entity"

@ObjectType()
class AuthResponse {
  @Field()
  access_token: string

  @Field(() => User)
  user: User
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async register(createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto)
  }

  @Mutation(() => AuthResponse)
  async login(loginDto: LoginDto) {
    return await this.authService.login(loginDto)
  }
}
