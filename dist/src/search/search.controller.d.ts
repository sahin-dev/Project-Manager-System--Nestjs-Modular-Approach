import type { SearchService, SearchResult, AutocompleteResult } from "./search.service";
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    search(query: string, type?: "task" | "project" | "user", projectId?: string, userId?: string, status?: string, priority?: string, page?: number, limit?: number): Promise<{
        results: SearchResult[];
        total: number;
    }>;
    autocomplete(query: string, limit?: number): Promise<AutocompleteResult[]>;
    fuzzySearch(query: string, maxDistance?: number): Promise<SearchResult[]>;
}
