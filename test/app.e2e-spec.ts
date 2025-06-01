import { Test, type TestingModule } from "@nestjs/testing"
import type { INestApplication } from "@nestjs/common"
import * as request from "supertest"
import { AppModule } from "../src/app.module"
import { describe, beforeEach, afterAll, it, expect } from "@jest/globals"

describe("AppController (e2e)", () => {
  let app: INestApplication
  let authToken: string

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe("Authentication", () => {
    it("/auth/register (POST)", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
          firstName: "Test",
          lastName: "User",
        })
        .expect(201)

      expect(response.body).toHaveProperty("access_token")
      expect(response.body.user).toHaveProperty("email", "test@example.com")
      authToken = response.body.access_token
    })

    it("/auth/login (POST)", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        })
        .expect(200)

      expect(response.body).toHaveProperty("access_token")
    })
  })

  describe("Projects", () => {
    it("/projects (POST) - should create a project", async () => {
      const response = await request(app.getHttpServer())
        .post("/projects")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test Project",
          description: "A test project",
        })
        .expect(201)

      expect(response.body).toHaveProperty("name", "Test Project")
    })

    it("/projects (GET) - should get all projects", async () => {
      const response = await request(app.getHttpServer())
        .get("/projects")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  describe("Tasks", () => {
    let projectId: string

    beforeEach(async () => {
      const projectResponse = await request(app.getHttpServer())
        .post("/projects")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Task Test Project",
          description: "Project for task testing",
        })

      projectId = projectResponse.body.id
    })

    it("/tasks (POST) - should create a task", async () => {
      const response = await request(app.getHttpServer())
        .post("/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Task",
          description: "A test task",
          projectId,
          priority: "high",
        })
        .expect(201)

      expect(response.body).toHaveProperty("title", "Test Task")
    })

    it("/tasks/prioritized (GET) - should get prioritized tasks", async () => {
      const response = await request(app.getHttpServer())
        .get("/tasks/prioritized")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })
  })
})
