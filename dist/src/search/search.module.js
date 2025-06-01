"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const elasticsearch_1 = require("@nestjs/elasticsearch");
const search_service_1 = require("./search.service");
const search_controller_1 = require("./search.controller");
const search_resolver_1 = require("./search.resolver");
const trie_service_1 = require("./services/trie.service");
const task_entity_1 = require("../tasks/entities/task.entity");
const project_entity_1 = require("../projects/entities/project.entity");
const user_entity_1 = require("../users/entities/user.entity");
let SearchModule = class SearchModule {
};
exports.SearchModule = SearchModule;
exports.SearchModule = SearchModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([task_entity_1.Task, project_entity_1.Project, user_entity_1.User]),
            elasticsearch_1.ElasticsearchModule.register({
                node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
            }),
        ],
        providers: [search_service_1.SearchService, search_resolver_1.SearchResolver, trie_service_1.TrieService],
        controllers: [search_controller_1.SearchController],
        exports: [search_service_1.SearchService, trie_service_1.TrieService],
    })
], SearchModule);
//# sourceMappingURL=search.module.js.map