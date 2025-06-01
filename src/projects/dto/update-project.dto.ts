import { PartialType } from "@nestjs/swagger"
import { CreateProjectDto } from "./create-project.dto"
import { IsBoolean, IsOptional } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
