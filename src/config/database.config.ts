import { DataSource } from "typeorm"
import { User } from "../users/entities/user.entity"
import { Project } from "../projects/entities/project.entity"
import { Task } from "../tasks/entities/task.entity"
import { Comment } from "../tasks/entities/comment.entity"
import { Notification } from "../notifications/entities/notification.entity"
import { Analytics } from "../analytics/entities/analytics.entity"

export const DatabaseConfig = {
  type: "postgres" as const,
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "project_management",
  entities: [User, Project, Task, Comment, Notification, Analytics],
  migrations: ["dist/migrations/*.js"],
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
}

export default new DataSource(DatabaseConfig)
