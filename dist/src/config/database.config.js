"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConfig = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const project_entity_1 = require("../projects/entities/project.entity");
const task_entity_1 = require("../tasks/entities/task.entity");
const comment_entity_1 = require("../tasks/entities/comment.entity");
const notification_entity_1 = require("../notifications/entities/notification.entity");
const analytics_entity_1 = require("../analytics/entities/analytics.entity");
exports.DatabaseConfig = {
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number.parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "project_management",
    entities: [user_entity_1.User, project_entity_1.Project, task_entity_1.Task, comment_entity_1.Comment, notification_entity_1.Notification, analytics_entity_1.Analytics],
    migrations: ["dist/migrations/*.js"],
    synchronize: process.env.NODE_ENV === "development",
    logging: process.env.NODE_ENV === "development",
};
exports.default = new typeorm_1.DataSource(exports.DatabaseConfig);
//# sourceMappingURL=database.config.js.map