import { IsEmail, IsString, IsEnum, IsOptional, IsArray, MinLength, MaxLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Role } from "../../common/enums/role.enum"

export class CreateUserDto {
  @ApiProperty({ example: "john.doe@example.com" })
  @IsEmail()
  email: string

  @ApiProperty({ example: "John" })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string

  @ApiProperty({ example: "Doe" })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string

  @ApiProperty({ example: "password123", minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string

  @ApiProperty({ enum: Role, example: Role.DEVELOPER })
  @IsEnum(Role)
  @IsOptional()
  role?: Role

  @ApiProperty({ example: "https://example.com/avatar.jpg", required: false })
  @IsString()
  @IsOptional()
  avatar?: string

  @ApiProperty({ example: "Experienced full-stack developer", required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string

  @ApiProperty({ example: ["JavaScript", "React", "Node.js"], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[]
}
