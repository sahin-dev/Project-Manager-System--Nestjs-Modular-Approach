"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const task_entity_1 = require("../tasks/entities/task.entity");
const project_entity_1 = require("../projects/entities/project.entity");
const user_entity_1 = require("../users/entities/user.entity");
const typeorm_1 = require("@nestjs/typeorm");
let SearchService = class SearchService {
    constructor(taskRepository, projectRepository, userRepository, elasticsearchService, trieService) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.elasticsearchService = elasticsearchService;
        this.trieService = trieService;
        this.INDEX_NAME = "project_management";
    }
    async onModuleInit() {
        await this.initializeElasticsearch();
        await this.buildTrieIndex();
    }
    async initializeElasticsearch() {
        try {
            const indexExists = await this.elasticsearchService.indices.exists({
                index: this.INDEX_NAME,
            });
            if (!indexExists) {
                await this.elasticsearchService.indices.create({
                    index: this.INDEX_NAME,
                    body: {
                        mappings: {
                            properties: {
                                title: {
                                    type: "text",
                                    analyzer: "standard",
                                    fields: {
                                        keyword: { type: "keyword" },
                                        suggest: {
                                            type: "completion",
                                            analyzer: "simple",
                                        },
                                    },
                                },
                                description: {
                                    type: "text",
                                    analyzer: "standard",
                                },
                                type: { type: "keyword" },
                                tags: { type: "keyword" },
                                skills: { type: "keyword" },
                                projectId: { type: "keyword" },
                                userId: { type: "keyword" },
                                status: { type: "keyword" },
                                priority: { type: "keyword" },
                                createdAt: { type: "date" },
                                updatedAt: { type: "date" },
                            },
                        },
                        settings: {
                            analysis: {
                                analyzer: {
                                    autocomplete: {
                                        type: "custom",
                                        tokenizer: "autocomplete",
                                        filter: ["lowercase"],
                                    },
                                    autocomplete_search: {
                                        type: "custom",
                                        tokenizer: "keyword",
                                        filter: ["lowercase"],
                                    },
                                },
                                tokenizer: {
                                    autocomplete: {
                                        type: "edge_ngram",
                                        min_gram: 2,
                                        max_gram: 10,
                                        token_chars: ["letter"],
                                    },
                                },
                            },
                        },
                    },
                });
            }
            await this.indexAllData();
        }
        catch (error) {
            console.error("Failed to initialize Elasticsearch:", error);
        }
    }
    async indexAllData() {
        try {
            const tasks = await this.taskRepository.find({
                relations: ["project", "creator", "assignee"],
            });
            for (const task of tasks) {
                await this.indexDocument({
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    type: "task",
                    tags: task.tags,
                    projectId: task.project.id,
                    status: task.status,
                    priority: task.priority,
                    createdAt: task.createdAt,
                    updatedAt: task.updatedAt,
                });
            }
            const projects = await this.projectRepository.find({
                relations: ["owner"],
            });
            for (const project of projects) {
                await this.indexDocument({
                    id: project.id,
                    title: project.name,
                    description: project.description,
                    type: "project",
                    userId: project.owner.id,
                    createdAt: project.createdAt,
                    updatedAt: project.updatedAt,
                });
            }
            const users = await this.userRepository.find();
            for (const user of users) {
                await this.indexDocument({
                    id: user.id,
                    title: `${user.firstName} ${user.lastName}`,
                    description: user.bio,
                    type: "user",
                    skills: user.skills,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                });
            }
        }
        catch (error) {
            console.error("Failed to index data:", error);
        }
    }
    async indexDocument(document) {
        try {
            await this.elasticsearchService.index({
                index: this.INDEX_NAME,
                id: document.id,
                body: document,
            });
        }
        catch (error) {
            console.error("Failed to index document:", error);
        }
    }
    async search(query, type, filters = {}, page = 1, limit = 10) {
        try {
            const must = [
                {
                    multi_match: {
                        query,
                        fields: ["title^3", "description^2", "tags", "skills"],
                        type: "best_fields",
                        fuzziness: "AUTO",
                    },
                },
            ];
            if (type) {
                must.push({ term: { type } });
            }
            if (filters.projectId) {
                must.push({ term: { projectId: filters.projectId } });
            }
            if (filters.userId) {
                must.push({ term: { userId: filters.userId } });
            }
            if (filters.status) {
                must.push({ term: { status: filters.status } });
            }
            if (filters.priority) {
                must.push({ term: { priority: filters.priority } });
            }
            const searchResponse = await this.elasticsearchService.search({
                index: this.INDEX_NAME,
                body: {
                    query: {
                        bool: { must },
                    },
                    highlight: {
                        fields: {
                            title: {},
                            description: {},
                            tags: {},
                            skills: {},
                        },
                    },
                    from: (page - 1) * limit,
                    size: limit,
                    sort: [{ _score: { order: "desc" } }, { updatedAt: { order: "desc" } }],
                },
            });
            const results = searchResponse.hits.hits.map((hit) => ({
                id: hit._source.id,
                title: hit._source.title,
                description: hit._source.description,
                type: hit._source.type,
                score: hit._score,
                highlights: hit.highlight
                    ? Object.values(hit.highlight)
                        .flat()
                        .map((h) => h.toString())
                    : [],
            }));
            return {
                results,
                total: typeof searchResponse.hits.total === "object"
                    ? searchResponse.hits.total.value
                    : searchResponse.hits.total,
            };
        }
        catch (error) {
            console.error("Search failed:", error);
            return { results: [], total: 0 };
        }
    }
    async autocomplete(query, limit = 10) {
        const trieResults = this.trieService.getWordsWithPrefix(query, limit);
        try {
            const esResponse = await this.elasticsearchService.search({
                index: this.INDEX_NAME,
                body: {
                    suggest: {
                        title_suggest: {
                            prefix: query,
                            completion: {
                                field: "title.suggest",
                                size: limit,
                            },
                        },
                    },
                },
            });
            const options = esResponse.suggest.title_suggest[0].options;
            const esSuggestions = Array.isArray(options)
                ? options.map((option) => ({
                    suggestion: option.text,
                    type: option._source?.type,
                    count: 1,
                }))
                : [];
            const combined = [...trieResults, ...esSuggestions];
            const unique = combined.reduce((acc, current) => {
                const existing = acc.find((item) => item.suggestion === current.suggestion);
                if (existing) {
                    existing.count += current.count || 1;
                }
                else {
                    acc.push({
                        suggestion: current.word || current.suggestion,
                        type: current.data?.type || current.type || "task",
                        count: current.count || 1,
                    });
                }
                return acc;
            }, []);
            return unique.slice(0, limit);
        }
        catch (error) {
            console.error("Autocomplete failed:", error);
            return trieResults.map((result) => ({
                suggestion: result.word,
                type: result.data?.type || "task",
                count: 1,
            }));
        }
    }
    async fuzzySearch(query, maxDistance = 2) {
        const fuzzyResults = this.trieService.fuzzySearch(query, maxDistance);
        return fuzzyResults.map((result) => ({
            id: result.data?.id || "",
            title: result.word,
            description: result.data?.description,
            type: result.data?.type || "task",
            score: 1 - result.distance / query.length,
        }));
    }
    async buildTrieIndex() {
        try {
            const items = [];
            const tasks = await this.taskRepository.find({
                relations: ["project"],
            });
            for (const task of tasks) {
                items.push({
                    searchText: task.title,
                    data: {
                        id: task.id,
                        type: "task",
                        description: task.description,
                    },
                });
                if (task.tags) {
                    for (const tag of task.tags) {
                        items.push({
                            searchText: tag,
                            data: {
                                id: task.id,
                                type: "task",
                                description: `Tag: ${tag}`,
                            },
                        });
                    }
                }
            }
            const projects = await this.projectRepository.find();
            for (const project of projects) {
                items.push({
                    searchText: project.name,
                    data: {
                        id: project.id,
                        type: "project",
                        description: project.description,
                    },
                });
            }
            const users = await this.userRepository.find();
            for (const user of users) {
                items.push({
                    searchText: `${user.firstName} ${user.lastName}`,
                    data: {
                        id: user.id,
                        type: "user",
                        description: user.bio,
                    },
                });
                items.push({
                    searchText: user.email,
                    data: {
                        id: user.id,
                        type: "user",
                        description: user.bio,
                    },
                });
                if (user.skills) {
                    for (const skill of user.skills) {
                        items.push({
                            searchText: skill,
                            data: {
                                id: user.id,
                                type: "user",
                                description: `Skill: ${skill}`,
                            },
                        });
                    }
                }
            }
            this.trieService.buildFromItems(items);
        }
        catch (error) {
            console.error("Failed to build Trie index:", error);
        }
    }
    async reindexDocument(id, type) {
        try {
            let document;
            switch (type) {
                case "task":
                    const task = await this.taskRepository.findOne({
                        where: { id },
                        relations: ["project", "creator", "assignee"],
                    });
                    if (task) {
                        document = {
                            id: task.id,
                            title: task.title,
                            description: task.description,
                            type: "task",
                            tags: task.tags,
                            projectId: task.project.id,
                            status: task.status,
                            priority: task.priority,
                            createdAt: task.createdAt,
                            updatedAt: task.updatedAt,
                        };
                    }
                    break;
                case "project":
                    const project = await this.projectRepository.findOne({
                        where: { id },
                        relations: ["owner"],
                    });
                    if (project) {
                        document = {
                            id: project.id,
                            title: project.name,
                            description: project.description,
                            type: "project",
                            userId: project.owner.id,
                            createdAt: project.createdAt,
                            updatedAt: project.updatedAt,
                        };
                    }
                    break;
                case "user":
                    const user = await this.userRepository.findOne({ where: { id } });
                    if (user) {
                        document = {
                            id: user.id,
                            title: `${user.firstName} ${user.lastName}`,
                            description: user.bio,
                            type: "user",
                            skills: user.skills,
                            createdAt: user.createdAt,
                            updatedAt: user.updatedAt,
                        };
                    }
                    break;
            }
            if (document) {
                await this.indexDocument(document);
                await this.buildTrieIndex();
            }
        }
        catch (error) {
            console.error("Failed to reindex document:", error);
        }
    }
    async deleteDocument(id) {
        try {
            await this.elasticsearchService.delete({
                index: this.INDEX_NAME,
                id,
            });
        }
        catch (error) {
            console.error("Failed to delete document:", error);
        }
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(1, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [Function, Function, Function, Function, Function])
], SearchService);
//# sourceMappingURL=search.service.js.map