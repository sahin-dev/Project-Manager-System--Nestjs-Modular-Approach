import { Controller, Post, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger"
import type { AuthService } from "./auth.service"
import { LocalAuthGuard } from "./guards/local-auth.guard"
import type { CreateUserDto } from "../users/dto/create-user.dto"
import type { LoginDto } from "./dto/login.dto"

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User registered successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async register(createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto)
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  @ApiOperation({ summary: "Login user" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async login(loginDto: LoginDto) {
    return await this.authService.login(loginDto)
  }
}
