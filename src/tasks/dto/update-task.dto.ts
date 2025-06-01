import { PartialType } from "@nestjs/swagger"
import { IsEnum, IsOptional, IsNumber, Min } from "class-validator"
import { CreateTaskDto } from "./create-task.dto"
import { TaskStatus } from "../../common/enums/task-status.enum"
import { ApiProperty } from "@nestjs/swagger"

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({ enum: TaskStatus, required: false })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus

  @ApiProperty({ example: 6, description: "Actual hours spent", required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  actualHours?: number
}
