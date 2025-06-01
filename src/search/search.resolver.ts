import { Resolver, Query } from "@nestjs/graphql"
import { UseGuards } from "@nestjs/common"
import type { SearchService } from "./search.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { ObjectType, Field, Int } from "@nestjs/graphql"

@ObjectType()
class SearchResultType {
  @Field()
  id: string

  @Field()
  title: string

  @Field({ nullable: true })
  description?: string

  @Field()
  type: string

  @Field()
  score: number

  @Field(() => [String], { nullable: true })
  highlights?: string[]
}

@ObjectType()
class SearchResponseType {
  @Field(() => [SearchResultType])
  results: SearchResultType[]

  @Field(() => Int)
  total: number
}

@ObjectType()
class AutocompleteResultType {
  @Field()
  suggestion: string

  @Field()
  type: string

  @Field(() => Int)
  count: number
}

@Resolver()
@UseGuards(JwtAuthGuard)
export class SearchResolver {
  constructor(private readonly searchService: SearchService) {}

  @Query(() => SearchResponseType, { name: "search" })
  async search(
    query: string,
    type?: string,
    projectId?: string,
    userId?: string,
    status?: string,
    priority?: string,
    page?: number,
    limit?: number,
  ) {
    return await this.searchService.search(
      query,
      type as "task" | "project" | "user",
      { projectId, userId, status, priority },
      page,
      limit,
    )
  }

  @Query(() => [AutocompleteResultType], { name: "autocomplete" })
  async autocomplete(query: string, limit?: number) {
    return await this.searchService.autocomplete(query, limit)
  }

  @Query(() => [SearchResultType], { name: "fuzzySearch" })
  async fuzzySearch(query: string, maxDistance?: number) {
    return await this.searchService.fuzzySearch(query, maxDistance)
  }
}
