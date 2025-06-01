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
- **Search**: Elasticsearch
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

\`\`\`env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/project_management
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=project_management

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# Application
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
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

#### Search Optimization
Implements Trie data structure for:
- O(k) prefix-based search where k is the query length
- Fuzzy search with edit distance tolerance
- Real-time autocomplete suggestions

## 📊 Performance Features

### Caching Strategy
- **Redis**: Session storage, frequently accessed data
- **Query Optimization**: Efficient database queries with proper indexing
- **Connection Pooling**: Optimized database connections

### Scalability
- **Horizontal Partitioning**: Ready for database sharding
- **Microservice Architecture**: Modular design for service separation
- **Load Balancing**: Stateless design for multiple instance deployment

### Monitoring
- **Health Checks**: Built-in health monitoring endpoints
- **Metrics Collection**: Performance and usage analytics
- **Error Tracking**: Comprehensive error logging and tracking

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permission system
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: TypeORM query builder protection

## 📈 Analytics & Reporting

### Tracked Metrics
- User activity and engagement
- Task completion rates and times
- Project progress and delays
- Team productivity metrics
- System performance indicators

### Report Generation
- PDF/CSV export functionality
- Customizable date ranges
- Project-specific reports
- User performance summaries

## 🚀 Deployment

### Production Deployment

\`\`\`bash
# Build for production
yarn build

# Start production server
yarn start:prod
\`\`\`

### Docker Production

\`\`\`bash
# Build production image
docker build -t project-management-backend:latest .

# Run with production compose
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

### Environment-Specific Configurations

- **Development**: Hot reload, detailed logging, Swagger UI
- **Staging**: Production-like environment with debug capabilities
- **Production**: Optimized performance, security hardening, monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain 90%+ test coverage
- Use conventional commit messages
- Update documentation for new features
- Ensure all tests pass before submitting PR

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api/docs`
- Review the test files for usage examples

## 🔮 Roadmap

- [ ] GraphQL subscriptions for real-time updates
- [ ] Advanced reporting with data visualization
- [ ] Mobile API optimizations
- [ ] AI-powered task estimation
- [ ] Integration with external tools (Slack, Jira, etc.)
- [ ] Advanced permission system with custom roles
- [ ] Multi-tenant architecture support
\`\`\`

This comprehensive backend provides a solid foundation for a collaborative project management tool with enterprise-grade features, intelligent algorithms, and production-ready architecture. The modular design allows for easy extension and maintenance while the comprehensive testing ensures reliability and performance.
