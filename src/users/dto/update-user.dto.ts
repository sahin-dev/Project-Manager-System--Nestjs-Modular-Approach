import { PartialType, OmitType } from "@nestjs/swagger"
import { CreateUserDto } from "./create-user.dto"

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ["email"] as const)) {
  email?: string
}
