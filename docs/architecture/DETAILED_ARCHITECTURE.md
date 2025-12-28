# Londa Rides Backend - Detailed Architecture Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Single-Port Architecture](#single-port-architecture)
3. [Microservices Design](#microservices-design)
4. [Design Patterns](#design-patterns)
5. [Technology Stack](#technology-stack)
6. [Service Architecture](#service-architecture)
7. [Data Flow](#data-flow)
8. [Environment Configuration](#environment-configuration)
9. [Security Architecture](#security-architecture)
10. [Scalability & Performance](#scalability--performance)
11. [Deployment Architecture](#deployment-architecture)

---

## Architecture Overview

Londa Rides backend is built using a **microservices architecture** with **Object-Oriented Programming (OOP)**, **Clean Code principles**, and the **MVC (Model-View-Controller) pattern**. The system follows best practices for backend development, ensuring maintainability, scalability, and testability.

### Core Principles

1. **Microservices**: Independent, deployable services with clear boundaries
2. **OOP**: Domain models as classes with encapsulated business logic
3. **Clean Code**: Meaningful names, small functions, DRY, single responsibility
4. **MVC**: Clear separation between Models, Views (DTOs), and Controllers
5. **Dependency Injection**: Loose coupling through DI container (TSyringe)
6. **Repository Pattern**: Abstraction of data access layer

---

## Single-Port Architecture

### Overview

The system uses a **single-port entry point** architecture where only **port 8000** is exposed externally through the API Gateway. All microservices run on internal ports and are accessible only through the gateway.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Client Requests                       │
│              Port 8000 (External Only)                   │
│         http://localhost:8000/api/v1/*                  │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────▼───────────┐
         │    API Gateway        │
         │   (Port 8000)         │
         │  Routes & Proxies     │
         │  All Traffic          │
         └───┬───┬───┬───┬────────┘
             │   │   │   │
    ┌────────┘   │   │   └────────┐
    │             │   │            │
┌───▼───┐  ┌─────▼───▼─────┐  ┌───▼───┐
│ Auth  │  │ User/Driver/   │  │ Ride  │
│ :8001 │  │ Ride Services │  │ :8004 │
│(intl) │  │  (internal)   │  │(intl) │
└───────┘  └───────────────┘  └───────┘
```

### Port Configuration

| Service | Port | Access | Purpose |
|---------|------|--------|---------|
| **API Gateway** | **8000** | ✅ **External** | **Only exposed port - all client requests** |
| Auth Service | 8001 | ❌ Internal | Authentication & authorization |
| User Service | 8002 | ❌ Internal | User management |
| Driver Service | 8003 | ❌ Internal | Driver management |
| Ride Service | 8004 | ❌ Internal | Ride operations |

### Benefits

1. **Security**: Internal services not directly accessible from outside
2. **Centralized Routing**: Single entry point for all API traffic
3. **Load Balancing**: Gateway can distribute load across service instances
4. **API Versioning**: Centralized version management
5. **Request/Response Transformation**: Gateway can modify requests/responses
6. **Rate Limiting**: Centralized rate limiting and throttling
7. **Monitoring**: Single point for logging and monitoring

### Request Flow

```
Client Request
    ↓
API Gateway (Port 8000)
    ↓
Route Matching (/api/v1/users, /api/v1/auth, etc.)
    ↓
Proxy to Internal Service (Port 8001-8004)
    ↓
Service Processing
    ↓
Response back through Gateway
    ↓
Client Response
```

---

## Microservices Design

### Service Independence

Each microservice is:
- **Independently deployable**: Can be deployed without affecting other services
- **Technology agnostic**: Can use different technologies (currently all use TypeScript/Node.js)
- **Database independent**: Each service has its own Firestore collections
- **Scalable**: Can scale independently based on load

### Service Communication

- **Synchronous**: HTTP/REST API calls through API Gateway
- **Asynchronous**: (Future) Message queue for event-driven communication
- **Service Discovery**: Environment variables for service URLs

### Service Responsibilities

#### 1. API Gateway Service
- **Port**: 8000 (external)
- **Responsibilities**:
  - Route incoming requests to appropriate microservices
  - Request/response proxying
  - Error handling and transformation
  - Health check aggregation
  - Request logging

#### 2. Auth Service
- **Port**: 8001 (internal)
- **Responsibilities**:
  - User authentication (login)
  - JWT token generation and validation
  - Token refresh
  - Password management

#### 3. User Service
- **Port**: 8002 (internal)
- **Responsibilities**:
  - User CRUD operations
  - User profile management
  - User validation
  - User data persistence

#### 4. Driver Service
- **Port**: 8003 (internal)
- **Responsibilities**:
  - Driver CRUD operations
  - Driver profile management
  - Driver status management
  - Driver validation

#### 5. Ride Service
- **Port**: 8004 (internal)
- **Responsibilities**:
  - Ride creation and management
  - Ride status tracking
  - Ride lifecycle management
  - Ride data persistence

---

## Design Patterns

### 1. Repository Pattern

**Purpose**: Abstract data access layer

**Implementation**:
```typescript
interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByPhoneNumber(phone: string): Promise<User | null>;
}

class FirestoreUserRepository implements IUserRepository {
  // Firestore-specific implementation
}
```

**Benefits**:
- Easy to swap database implementations
- Testable with mock repositories
- Clear separation of concerns

### 2. Dependency Injection (DI)

**Purpose**: Loose coupling and testability

**Implementation**: TSyringe container

```typescript
// Register dependencies
Container.register<IUserRepository>(TYPES.UserRepository, FirestoreUserRepository);
Container.register<IUserService>(TYPES.UserService, UserService);

// Resolve dependencies
const userService = Container.resolve<IUserService>(TYPES.UserService);
```

**Benefits**:
- Loose coupling between components
- Easy testing with mock dependencies
- Centralized dependency management

### 3. Factory Pattern

**Purpose**: Object creation and DTO conversion

**Implementation**:
```typescript
// Domain model factory
User.create({ phoneNumber: "+1234567890", ... })

// DTO factory
CreateUserDTOFactory.fromRequest(req.body)
UserResponseDTOFactory.fromDomain(user)
```

**Benefits**:
- Encapsulated object creation
- Validation during creation
- Consistent object initialization

### 4. MVC Pattern

**Structure**:
- **Model**: Domain entities (User, Driver, Ride classes)
- **View**: DTOs (Data Transfer Objects) for API responses
- **Controller**: HTTP request handlers

**Flow**:
```
Request → Controller → Service → Repository → Database
                ↓
Response ← DTO ← Domain Model ← Repository ← Database
```

### 5. Base Classes Pattern

**Purpose**: Code reuse and consistency

**Base Classes**:
- `BaseRepository<T>`: Common repository operations
- `BaseService`: Common service operations (error handling, logging)
- `BaseController`: Common controller operations (response formatting)

---

## Technology Stack

### Core Technologies

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.5+
- **Framework**: Express.js 4.19+
- **Database**: Firebase Firestore
- **Authentication**: JWT (JSON Web Tokens)

### Key Libraries

- **Dependency Injection**: TSyringe 4.8.0
- **Logging**: Pino (via StructuredLogger)
- **HTTP Client**: Axios (for inter-service communication)
- **Validation**: Custom validators + express-validator
- **Environment**: dotenv + cross-env

### Development Tools

- **TypeScript Compiler**: tsc
- **Hot Reload**: ts-node-dev
- **Process Manager**: concurrently
- **Testing**: Jest (planned)

---

## Service Architecture

### Directory Structure

```
backend/
├── shared/                    # Shared code package
│   ├── src/
│   │   ├── types/            # Type definitions, DTOs, enums
│   │   ├── exceptions/       # Custom exceptions
│   │   ├── base/             # Base classes
│   │   ├── di/               # Dependency injection
│   │   ├── utils/            # Utilities (Logger, Validator, etc.)
│   │   └── constants/        # Shared constants
│   └── package.json
│
├── services/
│   ├── api-gateway/          # API Gateway service
│   │   ├── src/
│   │   │   ├── gateway/      # Gateway logic
│   │   │   └── server.ts     # Entry point
│   │   └── package.json
│   │
│   ├── user-service/         # User management service
│   │   ├── src/
│   │   │   ├── models/       # Domain models (OOP)
│   │   │   ├── repositories/ # Data access layer
│   │   │   ├── services/     # Business logic layer
│   │   │   ├── controllers/  # HTTP handlers (MVC)
│   │   │   ├── routes/       # Route definitions
│   │   │   ├── middleware/   # Express middleware
│   │   │   ├── app.ts        # Express app setup
│   │   │   └── server.ts     # Entry point
│   │   └── package.json
│   │
│   ├── driver-service/       # Driver management service
│   ├── auth-service/         # Authentication service
│   └── ride-service/         # Ride management service
│
└── docs/                      # Documentation
```

### Service Layer Architecture

Each service follows this layered architecture:

```
┌─────────────────────────────────┐
│      Controller Layer (MVC)     │
│  - HTTP Request/Response         │
│  - DTO Conversion                │
│  - Error Handling                │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│      Service Layer (Business)    │
│  - Business Logic                │
│  - Validation                    │
│  - Domain Model Operations       │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│   Repository Layer (Data)        │
│  - Data Access                   │
│  - Persistence                   │
│  - Query Operations              │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│      Database (Firestore)        │
│  - Document Storage              │
│  - Collections                   │
└─────────────────────────────────┘
```

### Domain Model (OOP)

Domain models are classes with:
- **Encapsulation**: Private properties with getters
- **Business Logic**: Methods for domain operations
- **Immutability**: Read-only IDs and timestamps
- **Factory Methods**: `create()` and `fromPersistence()`

Example:
```typescript
class User {
  private constructor(
    private readonly id: string,
    private name: string,
    // ... other properties
  ) {}

  public static create(data: CreateUserDTO): User {
    // Validation and creation logic
  }

  public updateProfile(data: UpdateUserDTO): void {
    // Business logic for profile update
  }
}
```

---

## Data Flow

### Request Flow

1. **Client** sends HTTP request to API Gateway (port 8000)
2. **API Gateway** receives request and logs it
3. **Gateway** matches route (`/api/v1/users`, `/api/v1/auth`, etc.)
4. **Gateway** proxies request to appropriate microservice (port 8001-8004)
5. **Microservice** processes request:
   - Controller receives request
   - DTO conversion (Request → DTO)
   - Service layer business logic
   - Repository data access
   - Domain model operations
6. **Response** flows back through layers
7. **Gateway** receives response and forwards to client

### Error Flow

1. Error occurs in any layer
2. Custom exception thrown (e.g., `NotFoundException`, `ValidationException`)
3. Error middleware catches exception
4. Error formatted as JSON response
5. Gateway forwards error response to client

### Authentication Flow

1. Client sends login request to `/api/v1/auth/login`
2. Gateway proxies to Auth Service
3. Auth Service validates credentials
4. JWT token generated
5. Token returned to client
6. Client includes token in `Authorization: Bearer <token>` header
7. (Future) Gateway validates token before proxying to services

---

## Environment Configuration

### Environment Files

Each service has three environment files:
- `.env.dev` - Development environment
- `.env.uat` - User Acceptance Testing environment
- `.env.prd` - Production environment

### Environment Loading

The system automatically loads the appropriate file based on `NODE_ENV`:
```typescript
const env = process.env.NODE_ENV || 'dev';
const envFile = `.env.${env}`;
dotenv.config({ path: envFile });
```

### Configuration Variables

#### API Gateway
- `PORT=8000` (always)
- `USER_SERVICE_URL=http://localhost:8002`
- `DRIVER_SERVICE_URL=http://localhost:8003`
- `AUTH_SERVICE_URL=http://localhost:8001`
- `RIDE_SERVICE_URL=http://localhost:8004`
- `LOG_LEVEL=debug|info|error`

#### Services
- `PORT=8001|8002|8003|8004` (internal)
- `FIREBASE_SERVICE_ACCOUNT_KEY=path/to/key.json`
- `FIREBASE_PROJECT_ID=project-id`
- `LOG_LEVEL=debug|info|error`
- (Auth Service) `JWT_SECRET=secret-key`
- (Auth Service) `JWT_EXPIRES_IN=24h`

### Running with Different Environments

```bash
# Development
npm run dev:all:dev

# UAT
npm run dev:all:uat

# Production
npm run dev:all:prd
```

---

## Security Architecture

### Network Security

1. **Single Entry Point**: Only port 8000 exposed externally
2. **Internal Ports**: Ports 8001-8004 blocked by firewall in production
3. **HTTPS**: (Future) TLS/SSL for encrypted communication
4. **CORS**: Configured for allowed origins

### Authentication & Authorization

1. **JWT Tokens**: Stateless authentication
2. **Token Validation**: (Future) Gateway-level token validation
3. **Password Hashing**: bcrypt for password storage
4. **Secret Management**: Environment variables for secrets

### Data Security

1. **Input Validation**: All inputs validated at service layer
2. **SQL Injection**: Not applicable (NoSQL database)
3. **XSS Protection**: Input sanitization
4. **Error Handling**: No sensitive data in error messages

### Best Practices

- Production `.env.prd` files excluded from version control
- Strong JWT secrets in production
- Regular secret rotation
- Rate limiting (future)
- Request logging and monitoring

---

## Scalability & Performance

### Horizontal Scaling

- **Stateless Services**: Services can be scaled horizontally
- **Load Balancing**: Gateway can distribute load across service instances
- **Database**: Firestore scales automatically

### Performance Optimizations

1. **Connection Pooling**: Efficient database connections
2. **Caching**: (Future) Redis for frequently accessed data
3. **Pagination**: Large dataset handling
4. **Async Operations**: Non-blocking I/O
5. **Response Compression**: (Future) gzip compression

### Monitoring

- **Structured Logging**: Pino for performance logging
- **Health Checks**: `/health` endpoint for each service
- **Error Tracking**: Centralized error logging
- **Performance Metrics**: (Future) APM tools

---

## Deployment Architecture

### Development

```
Local Machine
├── API Gateway (Port 8000)
├── Auth Service (Port 8001)
├── User Service (Port 8002)
├── Driver Service (Port 8003)
└── Ride Service (Port 8004)
```

### Production (Future)

```
Load Balancer
    ↓
API Gateway Cluster (Port 8000)
    ├── Gateway Instance 1
    ├── Gateway Instance 2
    └── Gateway Instance N
    ↓
Service Clusters
    ├── Auth Service Cluster (Port 8001)
    ├── User Service Cluster (Port 8002)
    ├── Driver Service Cluster (Port 8003)
    └── Ride Service Cluster (Port 8004)
    ↓
Firebase Firestore (Managed)
```

### Containerization (Future)

- Docker containers for each service
- Kubernetes for orchestration
- Service mesh for inter-service communication

---

## Best Practices Implemented

### Code Quality

✅ **OOP**: Domain models as classes with encapsulation
✅ **Clean Code**: Meaningful names, small functions, DRY
✅ **SOLID Principles**: Single responsibility, dependency inversion
✅ **Type Safety**: TypeScript for compile-time checks
✅ **Error Handling**: Custom exceptions with proper HTTP codes

### Architecture

✅ **Microservices**: Independent, deployable services
✅ **MVC Pattern**: Clear separation of concerns
✅ **Repository Pattern**: Abstracted data access
✅ **Dependency Injection**: Loose coupling
✅ **Single Port**: Centralized entry point

### Operations

✅ **Environment Configuration**: Dev, UAT, Production
✅ **Structured Logging**: Pino for consistent logging
✅ **Health Checks**: Service health monitoring
✅ **Error Tracking**: Centralized error handling
✅ **Documentation**: Comprehensive API and architecture docs

---

## Future Enhancements

### Planned Features

1. **Service Mesh**: Istio or Linkerd for advanced routing
2. **Message Queue**: RabbitMQ/Kafka for async communication
3. **API Gateway Features**:
   - Rate limiting
   - Request/response transformation
   - API versioning
   - Circuit breaker pattern
4. **Caching**: Redis for performance
5. **Monitoring**: Prometheus + Grafana
6. **Tracing**: Distributed tracing with Jaeger
7. **Authentication**: Gateway-level JWT validation
8. **HTTPS**: TLS/SSL certificates

---

## Conclusion

The Londa Rides backend architecture provides a solid foundation for a scalable, maintainable, and secure ride-sharing platform. The microservices architecture with single-port entry point ensures security and scalability, while OOP and Clean Code principles ensure maintainability and testability.

For more information, see:
- [API Documentation](../api/DETAILED_API_DOCUMENTATION.md)
- [Environment Configuration](../../ENVIRONMENT_CONFIG.md)
- [Setup Guide](../../SETUP_AND_RUN_GUIDE.md)

