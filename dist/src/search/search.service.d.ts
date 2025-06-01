import { type OnModuleInit } from "@nestjs/common";
import type { Repository } from "typeorm";
import type { ElasticsearchService } from "@nestjs/elasticsearch";
import type { TrieService } from "./services/trie.service";
import { Task } from "../tasks/entities/task.entity";
import { Project } from "../projects/entities/project.entity";
import { User } from "../users/entities/user.entity";
export interface SearchResult {
    id: string;
    title: string;
    description?: string;
    type: "task" | "project" | "user";
    score: number;
    highlights?: string[];
}
export interface AutocompleteResult {
    suggestion: string;
    type: "task" | "project" | "user";
    count: number;
}
export declare class SearchService implements OnModuleInit {
    private taskRepository;
    private projectRepository;
    private userRepository;
    private elasticsearchService;
    private trieService;
    private readonly INDEX_NAME;
    constructor(taskRepository: Repository<Task>, projectRepository: Repository<Project>, userRepository: Repository<User>, elasticsearchService: ElasticsearchService, trieService: TrieService);
    onModuleInit(): Promise<void>;
    private initializeElasticsearch;
    private indexAllData;
    private indexDocument;
    search(query: string, type?: "task" | "project" | "user", filters?: {
        projectId?: string;
        userId?: string;
        status?: string;
        priority?: string;
    }, page?: number, limit?: number): Promise<{
        results: SearchResult[];
        total: number;
    }>;
    autocomplete(query: string, limit?: number): Promise<AutocompleteResult[]>;
    fuzzySearch(query: string, maxDistance?: number): Promise<SearchResult[]>;
    private buildTrieIndex;
    reindexDocument(id: string, type: "task" | "project" | "user"): Promise<void>;
    deleteDocument(id: string): Promise<void>;
}
