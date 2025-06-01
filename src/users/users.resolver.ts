// // import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql"
// import { UseGuards } from "@nestjs/common"
// import type { UsersService } from "./users.service"
// import { User } from "./entities/user.entity"
// import type { CreateUserDto } from "./dto/create-user.dto"
// import type { UpdateUserDto } from "./dto/update-user.dto"
// import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
// import { CurrentUser } from "../auth/decorators/current-user.decorator"
// import type { Role } from "../common/enums/role.enum"


// @UseGuards(JwtAuthGuard)
// export class UsersResolver {
//   constructor(private readonly usersService: UsersService) {}

 
//   async findAll(page: number, limit: number, role?: Role) {
//     const result = await this.usersService.findAll(page, limit, role)
//     return result.users
//   }


//   async findOne(@Args("id", { type: () => ID }) id: string) {
//     return await this.usersService.findOne(id)
//   }


//   async getProfile(@CurrentUser() user: User) {
//     return await this.usersService.findOne(user.id)
//   }


//   async createUser(@Args("createUserInput") createUserDto: CreateUserDto) {
//     return await this.usersService.create(createUserDto)
//   }


//   async updateUser(@Args("id", { type: () => ID }) id: string, @Args("updateUserInput") updateUserDto: UpdateUserDto) {
//     return await this.usersService.update(id, updateUserDto)
//   }


//   async removeUser(@Args("id", { type: () => ID }) id: string) {
//     await this.usersService.remove(id)
//     return true
//   }
// }
