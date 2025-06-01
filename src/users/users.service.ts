import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { Repository } from "typeorm"
import * as bcrypt from "bcryptjs"
import { User } from "./entities/user.entity"
import type { CreateUserDto } from "./dto/create-user.dto"
import type { UpdateUserDto } from "./dto/update-user.dto"
import type { Role } from "../common/enums/role.enum"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    })

    if (existingUser) {
      throw new BadRequestException("User with this email already exists")
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    })

    const savedUser = await this.userRepository.save(user)
    const { password, ...result } = savedUser
    return result as User
  }

  async findAll(page = 1, limit = 10, role?: Role): Promise<{ users: User[]; total: number }> {
    const queryBuilder = this.userRepository
      .createQueryBuilder("user")
      .select([
        "user.id",
        "user.email",
        "user.firstName",
        "user.lastName",
        "user.role",
        "user.avatar",
        "user.bio",
        "user.skills",
        "user.isActive",
        "user.createdAt",
        "user.updatedAt",
      ])
      .orderBy("user.createdAt", "DESC")

    if (role) {
      queryBuilder.where("user.role = :role", { role })
    }

    const [users, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return { users, total }
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        "id",
        "email",
        "firstName",
        "lastName",
        "role",
        "avatar",
        "bio",
        "skills",
        "isActive",
        "createdAt",
        "updatedAt",
      ],
      relations: ["ownedProjects", "projects", "assignedTasks"],
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    return user
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    })
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id)

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      })

      if (existingUser) {
        throw new BadRequestException("Email already in use")
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10)
    }

    await this.userRepository.update(id, updateUserDto)
    return await this.findOne(id)
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id)
    await this.userRepository.remove(user)
  }

  async deactivate(id: string): Promise<User> {
    await this.userRepository.update(id, { isActive: false })
    return await this.findOne(id)
  }

  async activate(id: string): Promise<User> {
    await this.userRepository.update(id, { isActive: true })
    return await this.findOne(id)
  }

  async getUsersBySkills(skills: string[]): Promise<User[]> {
    const queryBuilder = this.userRepository
      .createQueryBuilder("user")
      .where("user.isActive = :isActive", { isActive: true })

    if (skills.length > 0) {
      queryBuilder.andWhere("user.skills && :skills", { skills })
    }

    return await queryBuilder.getMany()
  }

  async getUserStats(id: string): Promise<any> {
    const user = await this.findOne(id)

    const stats = await this.userRepository
      .createQueryBuilder("user")
      .leftJoin("user.assignedTasks", "task")
      .leftJoin("user.ownedProjects", "project")
      .select([
        "COUNT(DISTINCT task.id) as assignedTasksCount",
        "COUNT(DISTINCT CASE WHEN task.status = 'done' THEN task.id END) as completedTasksCount",
        "COUNT(DISTINCT project.id) as ownedProjectsCount",
        "AVG(task.actualHours) as avgTaskHours",
      ])
      .where("user.id = :id", { id })
      .getRawOne()

    return {
      user,
      stats: {
        assignedTasks: Number.parseInt(stats.assignedTasksCount) || 0,
        completedTasks: Number.parseInt(stats.completedTasksCount) || 0,
        ownedProjects: Number.parseInt(stats.ownedProjectsCount) || 0,
        averageTaskHours: Number.parseFloat(stats.avgTaskHours) || 0,
        completionRate:
          stats.assignedTasksCount > 0
            ? (Number.parseInt(stats.completedTasksCount) / Number.parseInt(stats.assignedTasksCount)) * 100
            : 0,
      },
    }
  }
}
