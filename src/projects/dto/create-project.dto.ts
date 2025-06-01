import { IsString, IsOptional, IsDateString, MinLength, MaxLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateProjectDto {
  @ApiProperty({ example: "E-commerce Platform" })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string

  @ApiProperty({ example: "A comprehensive e-commerce platform with modern features", required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string

  @ApiProperty({ example: "2024-01-01T00:00:00Z", required: false })
  @IsDateString()
  @IsOptional()
  startDate?: Date

  @ApiProperty({ example: "2024-12-31T23:59:59Z", required: false })
  @IsDateString()
  @IsOptional()
  endDate?: Date
}
