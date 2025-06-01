# Collaborative Project Management Tool - Backend

A comprehensive project management backend built with NestJS, featuring real-time collaboration, intelligent task scheduling, and advanced analytics.

## 🚀 Features

### Core Functionality
- **User Management**: Role-based access control (Admin, Project Manager, Team Lead, Developer, Viewer)
- **Project Management**: Create, manage, and track projects with team collaboration
- **Task Management**: Advanced task creation, assignment, and tracking with dependencies
- **Real-time Notifications**: WebSocket-based real-time updates and notifications
- **Search & Autocomplete**: Elasticsearch integration with Trie-based autocomplete

### Advanced Features
- **Intelligent Task Assignment**: Algorithm-based task assignment considering skills, workload, and priority
- **Dependency Resolution**: Topological sorting for task dependencies with circular dependency detection
- **Performance Analytics**: Comprehensive tracking of user activity and project metrics
- **Load Testing Ready**: Built to handle high traffic with Redis caching and horizontal scaling

### Technical Highlights
- **Modular Architecture**: Clean separation of concerns with feature modules
- **GraphQL + REST**: Flexible API access patterns
- **Rate Limiting**: Protection against API abuse
- **Comprehensive Testing**: 90%+ test coverage with unit, integration, and e2e tests
- **Docker Support**: Full containerization with Docker Compose

## 🛠️ Technology Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Caching**: Redis
- **Real-time**: Socket.io WebSockets
- **Authentication**: JWT with Passport
- **Testing**: Jest, Supertest
- **Documentation**: Swagger/OpenAPI

## 📋 Prerequisites

- Node.js 18+ and yarn
- Docker and Docker Compose
- PostgreSQL 15+
- Redis 7+
- Elasticsearch 8+

## 🚀 Quick Start

### Using Docker (Recommended)

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd project-management-backend

# Start all services
docker-compose up -d

# The API will be available at http://localhost:3000
# API Documentation: http://localhost:3000/api/docs
\`\`\`

### Manual Setup

\`\`\`bash
# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start PostgreSQL and Redis
# Update connection strings in .env

# Run database migrations
yarn migration:run

# Start the development server
yarn start:dev
\`\`\`

## 🔧 Environment Variables

\`\`\`


# Application
PORT=3000
NODE_ENV=development

\`\`\`

## 📚 API Documentation

### Authentication Endpoints

\`\`\`bash
# Register a new user
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "developer"
}

# Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

### Project Management

\`\`\`bash
# Create project
POST /projects
Authorization: Bearer <token>
{
  "name": "New Project",
  "description": "Project description",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}

# Get all projects
GET /projects
Authorization: Bearer <token>

# Get project by ID
GET /projects/:id
Authorization: Bearer <token>
\`\`\`

### Task Management

\`\`\`bash
# Create task
POST /tasks
Authorization: Bearer <token>
{
  "title": "Implement feature",
  "description": "Detailed description",
  "projectId": "uuid",
  "priority": "high",
  "estimatedHours": 8,
  "dueDate": "2024-02-01",
  "tags": ["frontend", "react"]
}

# Get prioritized tasks
GET /tasks/prioritized
Authorization: Bearer <token>

# Auto-assign task
POST /tasks/:id/assign
Authorization: Bearer <token>

# Add task dependencies
POST /tasks/:id/dependencies
Authorization: Bearer <token>
{
  "dependencyIds": ["uuid1", "uuid2"]
}
\`\`\`

### Search & Analytics

\`\`\`bash
# Search across projects and tasks
GET /search?q=keyword&type=task
Authorization: Bearer <token>

# Get autocomplete suggestions
GET /search/autocomplete?q=prefix
Authorization: Bearer <token>

# Get project analytics
GET /analytics/projects/:id
Authorization: Bearer <token>

# Get user performance metrics
GET /analytics/users/:id
Authorization: Bearer <token>
\`\`\`

## 🧪 Testing

\`\`\`bash
# Run unit tests
yarn test

# Run tests with coverage
yarn test:cov

# Run e2e tests
yarn test:e2e

# Run tests in watch mode
yarn test:watch
\`\`\`

## 🏗️ Architecture Overview

### Module Structure

\`\`\`
src/
├── modules/
│   ├── auth/              # Authentication & authorization
│   ├── users/             # User management
│   ├── projects/          # Project management
│   ├── tasks/             # Task management with algorithms
│   ├── notifications/     # Real-time notifications
│   ├── analytics/         # Performance tracking
│   ├── search/            # Search with Trie implementation
│   └── reports/           # Report generation
├── common/
│   ├── enums/             # Shared enumerations
│   ├── guards/            # Authentication guards
│   └── decorators/        # Custom decorators
└── config/                # Configuration files
\`\`\`

### Key Algorithms

#### Task Scheduling Algorithm
The intelligent task assignment considers:
- **Skill Matching** (40%): Matches user skills with task requirements
- **Workload Balance** (30%): Distributes tasks evenly across team members
- **Priority Weighting** (20%): Prioritizes critical and high-priority tasks
- **Availability** (10%): Considers user active status

#### Dependency Resolution
Uses topological sorting (Kahn's algorithm) to:
- Resolve task execution order
- Detect circular dependencies
- Validate dependency chains before assignment


