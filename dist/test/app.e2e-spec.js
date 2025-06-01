"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = __importStar(require("supertest"));
const app_module_1 = require("../src/app.module");
const globals_1 = require("@jest/globals");
(0, globals_1.describe)("AppController (e2e)", () => {
    let app;
    let authToken;
    (0, globals_1.beforeEach)(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    });
    (0, globals_1.afterAll)(async () => {
        await app.close();
    });
    (0, globals_1.describe)("Authentication", () => {
        (0, globals_1.it)("/auth/register (POST)", async () => {
            const response = await request(app.getHttpServer())
                .post("/auth/register")
                .send({
                email: "test@example.com",
                password: "password123",
                firstName: "Test",
                lastName: "User",
            })
                .expect(201);
            (0, globals_1.expect)(response.body).toHaveProperty("access_token");
            (0, globals_1.expect)(response.body.user).toHaveProperty("email", "test@example.com");
            authToken = response.body.access_token;
        });
        (0, globals_1.it)("/auth/login (POST)", async () => {
            const response = await request(app.getHttpServer())
                .post("/auth/login")
                .send({
                email: "test@example.com",
                password: "password123",
            })
                .expect(200);
            (0, globals_1.expect)(response.body).toHaveProperty("access_token");
        });
    });
    (0, globals_1.describe)("Projects", () => {
        (0, globals_1.it)("/projects (POST) - should create a project", async () => {
            const response = await request(app.getHttpServer())
                .post("/projects")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                name: "Test Project",
                description: "A test project",
            })
                .expect(201);
            (0, globals_1.expect)(response.body).toHaveProperty("name", "Test Project");
        });
        (0, globals_1.it)("/projects (GET) - should get all projects", async () => {
            const response = await request(app.getHttpServer())
                .get("/projects")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);
            (0, globals_1.expect)(Array.isArray(response.body)).toBe(true);
        });
    });
    (0, globals_1.describe)("Tasks", () => {
        let projectId;
        (0, globals_1.beforeEach)(async () => {
            const projectResponse = await request(app.getHttpServer())
                .post("/projects")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                name: "Task Test Project",
                description: "Project for task testing",
            });
            projectId = projectResponse.body.id;
        });
        (0, globals_1.it)("/tasks (POST) - should create a task", async () => {
            const response = await request(app.getHttpServer())
                .post("/tasks")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                title: "Test Task",
                description: "A test task",
                projectId,
                priority: "high",
            })
                .expect(201);
            (0, globals_1.expect)(response.body).toHaveProperty("title", "Test Task");
        });
        (0, globals_1.it)("/tasks/prioritized (GET) - should get prioritized tasks", async () => {
            const response = await request(app.getHttpServer())
                .get("/tasks/prioritized")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);
            (0, globals_1.expect)(Array.isArray(response.body)).toBe(true);
        });
    });
});
//# sourceMappingURL=app.e2e-spec.js.map