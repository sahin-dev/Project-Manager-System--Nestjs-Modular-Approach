import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsNumber,
  IsDateString,
  IsUUID,
  MinLength,
  MaxLength,
  Min,
} from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { TaskPriority } from "../../common/enums/task-priority.enum"

export class CreateTaskDto {
  @ApiProperty({ example: "Implement user authentication" })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string

  @ApiProperty({ example: "Implement JWT-based authentication system", required: false })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.HIGH })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority

  @ApiProperty({ example: 8, description: "Estimated hours to complete" })
  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedHours?: number

  @ApiProperty({ example: "2024-02-01T00:00:00Z", required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: Date

  @ApiProperty({ example: ["frontend", "authentication", "react"], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[]

  @ApiProperty({ example: "uuid-of-project" })
  @IsUUID()
  projectId: string
}
