// import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql"
// import { UseGuards } from "@nestjs/common"
// import type { ProjectsService } from "./projects.service"
// import { Project } from "./entities/project.entity"
// import type { CreateProjectDto } from "./dto/create-project.dto"
// import type { UpdateProjectDto } from "./dto/update-project.dto"
// import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
// import { CurrentUser } from "../auth/decorators/current-user.decorator"
// import type { User } from "../users/entities/user.entity"

// @Resolver(() => Project)
// @UseGuards(JwtAuthGuard)
// export class ProjectsResolver {
//   constructor(private readonly projectsService: ProjectsService) {}

//   @Query(() => [Project], { name: "projects" })
//   async findAll(page: number, limit: number, isActive?: boolean, @CurrentUser() user?: User) {
//     const result = await this.projectsService.findAll(page, limit, user?.id, isActive)
//     return result.projects
//   }

//   @Query(() => Project, { name: "project" })
//   async findOne(@Args("id", { type: () => ID }) id: string, @CurrentUser() user: User) {
//     return await this.projectsService.findOne(id, user.id)
//   }

//   @Query(() => [Project], { name: "myProjects" })
//   async getMyProjects(
//     @CurrentUser() user: User,
//     @Args("role", { type: () => String, nullable: true }) role?: "owner" | "member",
//   ) {
//     return await this.projectsService.getUserProjects(user.id, role)
//   }

//   @Mutation(() => Project)
//   async createProject(@Args("createProjectInput") createProjectDto: CreateProjectDto, @CurrentUser() user: User) {
//     return await this.projectsService.create(createProjectDto, user.id)
//   }

//   @Mutation(() => Project)
//   async updateProject(
//     @Args("id", { type: () => ID }) id: string,
//     @Args("updateProjectInput") updateProjectDto: UpdateProjectDto,
//     @CurrentUser() user: User,
//   ) {
//     return await this.projectsService.update(id, updateProjectDto, user.id)
//   }

//   @Mutation(() => Project)
//   async addProjectMember(
//     @Args("projectId", { type: () => ID }) projectId: string,
//     @Args("memberId", { type: () => ID }) memberId: string,
//     @CurrentUser() user: User,
//   ) {
//     return await this.projectsService.addMember(projectId, memberId, user.id)
//   }

//   @Mutation(() => Boolean)
//   async removeProject(@Args("id", { type: () => ID }) id: string, @CurrentUser() user: User) {
//     await this.projectsService.remove(id, user.id)
//     return true
//   }
// }
