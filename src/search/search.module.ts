import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ElasticsearchModule } from "@nestjs/elasticsearch"
import { SearchService } from "./search.service"
import { SearchController } from "./search.controller"
import { SearchResolver } from "./search.resolver"
import { TrieService } from "./services/trie.service"
import { Task } from "../tasks/entities/task.entity"
import { Project } from "../projects/entities/project.entity"
import { User } from "../users/entities/user.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Project, User]),
    ElasticsearchModule.register({
      node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
    }),
  ],
  providers: [SearchService, SearchResolver, TrieService],
  controllers: [SearchController],
  exports: [SearchService, TrieService],
})
export class SearchModule {}
