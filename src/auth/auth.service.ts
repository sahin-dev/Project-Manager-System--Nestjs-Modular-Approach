import { Injectable, UnauthorizedException } from "@nestjs/common"
import type { JwtService } from "@nestjs/jwt"
import type { Repository } from "typeorm"
import * as bcrypt from "bcryptjs"

import type { User } from "../users/entities/user.entity"
import type { CreateUserDto } from "../users/dto/create-user.dto"
import type { LoginDto } from "./dto/login.dto"

@Injectable()
export class AuthService {
  private userRepository: Repository<User>
  private jwtService: JwtService

  constructor(userRepository: Repository<User>, jwtService: JwtService) {
    this.userRepository = userRepository
    this.jwtService = jwtService
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } })

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user
      return result
    }
    return null
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password)

    if (!user) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const payload = { email: user.email, sub: user.id, role: user.role }

    return {
      access_token: this.jwtService.sign(payload),
      user,
    }
  }

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    })

    if (existingUser) {
      throw new UnauthorizedException("User already exists")
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    })

    const savedUser = await this.userRepository.save(user)
    const { password, ...result } = savedUser

    const payload = { email: result.email, sub: result.id, role: result.role }

    return {
      access_token: this.jwtService.sign(payload),
      user: result,
    }
  }
}
