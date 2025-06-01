import type { SearchService } from "./search.service";
export declare class SearchResolver {
    private readonly searchService;
    constructor(searchService: SearchService);
    search(query: string, type?: string, projectId?: string, userId?: string, status?: string, priority?: string, page?: number, limit?: number): Promise<{
        results: import("./search.service").SearchResult[];
        total: number;
    }>;
    autocomplete(query: string, limit?: number): Promise<import("./search.service").AutocompleteResult[]>;
    fuzzySearch(query: string, maxDistance?: number): Promise<import("./search.service").SearchResult[]>;
}
