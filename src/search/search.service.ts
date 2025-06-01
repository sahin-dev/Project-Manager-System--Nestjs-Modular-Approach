import { Injectable, type OnModuleInit } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { ElasticsearchService } from "@nestjs/elasticsearch"
import type { TrieService } from "./services/trie.service"
import { Task } from "../tasks/entities/task.entity"
import { Project } from "../projects/entities/project.entity"
import { User } from "../users/entities/user.entity"
import { InjectRepository } from "@nestjs/typeorm"

export interface SearchResult {
  id: string
  title: string
  description?: string
  type: "task" | "project" | "user"
  score: number
  highlights?: string[]
}

export interface AutocompleteResult {
  suggestion: string
  type: "task" | "project" | "user"
  count: number
}

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly INDEX_NAME = "project_management"
constructor(
  @InjectRepository(Task)
  private taskRepository: Repository<Task>,
  @InjectRepository(Project)
  private projectRepository: Repository<Project>,
  @InjectRepository(User)
  private userRepository: Repository<User>,
  private elasticsearchService: ElasticsearchService,
  private trieService: TrieService,
) {}
  async onModuleInit() {
    await this.initializeElasticsearch()
    await this.buildTrieIndex()
  }

  private async initializeElasticsearch() {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.INDEX_NAME,
      })

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
        })
      }

      await this.indexAllData()
    } catch (error) {
      console.error("Failed to initialize Elasticsearch:", error)
    }
  }

  private async indexAllData() {
    try {
      // Index tasks
      const tasks = await this.taskRepository.find({
        relations: ["project", "creator", "assignee"],
      })

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
        })
      }

      // Index projects
      const projects = await this.projectRepository.find({
        relations: ["owner"],
      })

      for (const project of projects) {
        await this.indexDocument({
          id: project.id,
          title: project.name,
          description: project.description,
          type: "project",
          userId: project.owner.id,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        })
      }

      // Index users
      const users = await this.userRepository.find()

      for (const user of users) {
        await this.indexDocument({
          id: user.id,
          title: `${user.firstName} ${user.lastName}`,
          description: user.bio,
          type: "user",
          skills: user.skills,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })
      }
    } catch (error) {
      console.error("Failed to index data:", error)
    }
  }

  private async indexDocument(document: any) {
    try {
      await this.elasticsearchService.index({
        index: this.INDEX_NAME,
        id: document.id,
        body: document,
      })
    } catch (error) {
      console.error("Failed to index document:", error)
    }
  }

  async search(
    query: string,
    type?: "task" | "project" | "user",
    filters: {
      projectId?: string
      userId?: string
      status?: string
      priority?: string
    } = {},
    page = 1,
    limit = 10,
  ): Promise<{ results: SearchResult[]; total: number }> {
    try {
      const must: any[] = [
        {
          multi_match: {
            query,
            fields: ["title^3", "description^2", "tags", "skills"],
            type: "best_fields",
            fuzziness: "AUTO",
          },
        },
      ]

      if (type) {
        must.push({ term: { type } })
      }

      if (filters.projectId) {
        must.push({ term: { projectId: filters.projectId } })
      }

      if (filters.userId) {
        must.push({ term: { userId: filters.userId } })
      }

      if (filters.status) {
        must.push({ term: { status: filters.status } })
      }

      if (filters.priority) {
        must.push({ term: { priority: filters.priority } })
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
      })

      const results: SearchResult[] = searchResponse.hits.hits.map((hit: any) => ({
        id: hit._source.id,
        title: hit._source.title,
        description: hit._source.description,
        type: hit._source.type,
        score: hit._score,
        highlights: hit.highlight
          ? Object.values(hit.highlight)
              .flat()
              .map((h: any) => h.toString())
          : [],
      }))

      return {
        results,
        total: typeof searchResponse.hits.total === "object"
          ? searchResponse.hits.total.value
          : searchResponse.hits.total,
      }
    } catch (error) {
      console.error("Search failed:", error)
      return { results: [], total: 0 }
    }
  }

  async autocomplete(query: string, limit = 10): Promise<AutocompleteResult[]> {
    // Use Trie for fast prefix matching
    const trieResults = this.trieService.getWordsWithPrefix(query, limit)

    // Also get Elasticsearch suggestions
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
      })

      const options = esResponse.suggest.title_suggest[0].options
      const esSuggestions = Array.isArray(options)
        ? options.map((option: any) => ({
            suggestion: option.text,
            type: option._source?.type,
            count: 1,
          }))
        : []

      // Combine and deduplicate results
      const combined = [...trieResults, ...esSuggestions]
      const unique = combined.reduce((acc, current) => {
        const existing = acc.find((item) => item.suggestion === current.suggestion)
        if (existing) {
          existing.count += current.count || 1
        } else {
          acc.push({
            suggestion: current.word || current.suggestion,
            type: current.data?.type || current.type || "task",
            count: current.count || 1,
          })
        }
        return acc
      }, [] as AutocompleteResult[])

      return unique.slice(0, limit)
    } catch (error) {
      console.error("Autocomplete failed:", error)
      return trieResults.map((result) => ({
        suggestion: result.word,
        type: result.data?.type || "task",
        count: 1,
      }))
    }
  }

  async fuzzySearch(query: string, maxDistance = 2): Promise<SearchResult[]> {
    const fuzzyResults = this.trieService.fuzzySearch(query, maxDistance)

    return fuzzyResults.map((result) => ({
      id: result.data?.id || "",
      title: result.word,
      description: result.data?.description,
      type: result.data?.type || "task",
      score: 1 - result.distance / query.length, // Convert distance to score
    }))
  }

  private async buildTrieIndex() {
    try {
      const items: Array<{ searchText: string; data: any }> = []

      // Add tasks to Trie
      const tasks = await this.taskRepository.find({
        relations: ["project"],
      })

      for (const task of tasks) {
        items.push({
          searchText: task.title,
          data: {
            id: task.id,
            type: "task",
            description: task.description,
          },
        })

        // Add tags
        if (task.tags) {
          for (const tag of task.tags) {
            items.push({
              searchText: tag,
              data: {
                id: task.id,
                type: "task",
                description: `Tag: ${tag}`,
              },
            })
          }
        }
      }

      // Add projects to Trie
      const projects = await this.projectRepository.find()

      for (const project of projects) {
        items.push({
          searchText: project.name,
          data: {
            id: project.id,
            type: "project",
            description: project.description,
          },
        })
      }

      // Add users to Trie
      const users = await this.userRepository.find()

      for (const user of users) {
        items.push({
          searchText: `${user.firstName} ${user.lastName}`,
          data: {
            id: user.id,
            type: "user",
            description: user.bio,
          },
        })

        items.push({
          searchText: user.email,
          data: {
            id: user.id,
            type: "user",
            description: user.bio,
          },
        })

        // Add skills
        if (user.skills) {
          for (const skill of user.skills) {
            items.push({
              searchText: skill,
              data: {
                id: user.id,
                type: "user",
                description: `Skill: ${skill}`,
              },
            })
          }
        }
      }

      this.trieService.buildFromItems(items)
    } catch (error) {
      console.error("Failed to build Trie index:", error)
    }
  }

  async reindexDocument(id: string, type: "task" | "project" | "user") {
    try {
      let document: any

      switch (type) {
        case "task":
          const task = await this.taskRepository.findOne({
            where: { id },
            relations: ["project", "creator", "assignee"],
          })
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
            }
          }
          break

        case "project":
          const project = await this.projectRepository.findOne({
            where: { id },
            relations: ["owner"],
          })
          if (project) {
            document = {
              id: project.id,
              title: project.name,
              description: project.description,
              type: "project",
              userId: project.owner.id,
              createdAt: project.createdAt,
              updatedAt: project.updatedAt,
            }
          }
          break

        case "user":
          const user = await this.userRepository.findOne({ where: { id } })
          if (user) {
            document = {
              id: user.id,
              title: `${user.firstName} ${user.lastName}`,
              description: user.bio,
              type: "user",
              skills: user.skills,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            }
          }
          break
      }

      if (document) {
        await this.indexDocument(document)
        await this.buildTrieIndex() // Rebuild Trie index
      }
    } catch (error) {
      console.error("Failed to reindex document:", error)
    }
  }

  async deleteDocument(id: string) {
    try {
      await this.elasticsearchService.delete({
        index: this.INDEX_NAME,
        id,
      })
    } catch (error) {
      console.error("Failed to delete document:", error)
    }
  }
}
