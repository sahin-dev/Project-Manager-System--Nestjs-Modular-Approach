import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { UsersService } from "./users.service"
import { User } from "./entities/user.entity"
import type { CreateUserDto } from "./dto/create-user.dto"
import { Role } from "../common/enums/role.enum"
import { jest } from "@jest/globals"

describe("UsersService", () => {
  let service: UsersService
  let repository: Repository<User>

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
    })),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    repository = module.get<Repository<User>>(getRepositoryToken(User))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("create", () => {
    it("should create a new user", async () => {
      const createUserDto: CreateUserDto = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        role: Role.DEVELOPER,
      }

      const expectedUser = {
        id: "1",
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never

      mockRepository.create.mockReturnValue(expectedUser)
      mockRepository.save.mockResolvedValue(expectedUser)

      const result = await service.create(createUserDto)

      expect(mockRepository.create).toHaveBeenCalledWith(createUserDto)
      expect(mockRepository.save).toHaveBeenCalledWith(expectedUser)
      expect(result).toEqual(expectedUser)
    })
  })

  describe("findAll", () => {
    it("should return an array of users", async () => {
      const expectedUsers = [
        { id: "1", email: "user1@example.com" },
        { id: "2", email: "user2@example.com" },
      ] as never

      mockRepository.find.mockResolvedValue(expectedUsers)

      const result = await service.findAll()

      expect(mockRepository.find).toHaveBeenCalled()
      expect(result).toEqual(expectedUsers)
    })
  })

  describe("findOne", () => {
    it("should return a user by id", async () => {
      const expectedUser = { id: "1", email: "test@example.com" } as never

      mockRepository.findOne.mockResolvedValue(expectedUser)

      const result = await service.findOne("1")

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
      })
      expect(result).toEqual(expectedUser)
    })

    it("should return null if user not found", async () => {
      mockRepository.findOne.mockResolvedValue(null as never)

      const result = await service.findOne("999")

      expect(result).toBeNull()
    })
  })
})
