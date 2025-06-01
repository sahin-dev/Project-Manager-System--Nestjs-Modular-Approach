import { IsString, MinLength, MaxLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateCommentDto {
  @ApiProperty({ example: "This task is blocked by the database migration issue." })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content: string
}
