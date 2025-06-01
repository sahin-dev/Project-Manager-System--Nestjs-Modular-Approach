import { Controller, Get, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"
import type { SearchService, SearchResult, AutocompleteResult } from "./search.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@ApiTags("search")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: "Search across tasks, projects, and users" })
  @ApiQuery({ name: "q", required: true, type: String, description: "Search query" })
  @ApiQuery({ name: "type", required: false, enum: ["task", "project", "user"], description: "Filter by type" })
  @ApiQuery({ name: "projectId", required: false, type: String, description: "Filter by project ID" })
  @ApiQuery({ name: "userId", required: false, type: String, description: "Filter by user ID" })
  @ApiQuery({ name: "status", required: false, type: String, description: "Filter by status" })
  @ApiQuery({ name: "priority", required: false, type: String, description: "Filter by priority" })
  @ApiQuery({ name: "page", required: false, type: Number, description: "Page number" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Items per page" })
  @ApiResponse({ status: 200, description: "Search results retrieved successfully" })
  async search(
    query: string,
    type?: "task" | "project" | "user",
    projectId?: string,
    userId?: string,
    status?: string,
    priority?: string,
    page = 1,
    limit = 10,
  ): Promise<{ results: SearchResult[]; total: number }> {
    return await this.searchService.search(query, type, { projectId, userId, status, priority }, page, limit)
  }

  @Get("autocomplete")
  @ApiOperation({ summary: "Get autocomplete suggestions" })
  @ApiQuery({ name: "q", required: true, type: String, description: "Search query prefix" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Maximum suggestions" })
  @ApiResponse({ status: 200, description: "Autocomplete suggestions retrieved successfully" })
  async autocomplete(query: string, limit = 10): Promise<AutocompleteResult[]> {
    return await this.searchService.autocomplete(query, limit)
  }

  @Get("fuzzy")
  @ApiOperation({ summary: "Fuzzy search with typo tolerance" })
  @ApiQuery({ name: "q", required: true, type: String, description: "Search query" })
  @ApiQuery({ name: "distance", required: false, type: Number, description: "Maximum edit distance" })
  @ApiResponse({ status: 200, description: "Fuzzy search results retrieved successfully" })
  async fuzzySearch(query: string, maxDistance = 2): Promise<SearchResult[]> {
    return await this.searchService.fuzzySearch(query, maxDistance)
  }
}
