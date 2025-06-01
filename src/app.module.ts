import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
// import { GraphQLModule } from "@nestjs/graphql"
// import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo"
import { ThrottlerModule } from "@nestjs/throttler"
import { BullModule } from "@nestjs/bull"
import { ElasticsearchModule } from "@nestjs/elasticsearch"
import { ConfigModule } from "@nestjs/config"
import { DatabaseConfig } from "./config/database.config"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { ProjectsModule } from "./projects/projects.module"
import { TasksModule } from "./tasks/tasks.module"
import { NotificationsModule } from "./notifications/notifications.module"
import { AnalyticsModule } from "./analytics/analytics.module"
import { SearchModule } from "./search/search.module"
import { ReportsModule } from "./reports/reports.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Database
    TypeOrmModule.forRoot(DatabaseConfig),

    // GraphQL
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   autoSchemaFile: "schema.gql",
    //   context: ({ req }) => ({ req }),
    //   playground: true,
    //   introspection: true,
    // }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),


    // Redis/Bull for job queues
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: Number.parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),

    // Elasticsearch
    ElasticsearchModule.register({
      node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    NotificationsModule,
    AnalyticsModule,
    SearchModule,
    ReportsModule,
  ],
})
export class AppModule {}
