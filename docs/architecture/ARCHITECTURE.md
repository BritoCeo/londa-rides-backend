# Londa Rides Backend Architecture

## Overview
Londa Rides backend follows a microservices architecture with OOP, Clean Code, and MVC patterns.

## Architecture Principles

### 1. Microservices
- Each service is independently deployable
- Services communicate via HTTP/REST
- Each service has its own database (Firestore collections)

### 2. OOP (Object-Oriented Programming)
- Domain models as classes with business logic
- Services as classes with dependency injection
- Repositories as classes implementing interfaces

### 3. Clean Code
- Meaningful names
- Small, focused functions
- DRY principle
- Single Responsibility Principle

### 4. MVC Pattern
- **Models**: Domain entities (OOP classes)
- **Views**: API responses (DTOs)
- **Controllers**: HTTP request handlers

## Service Architecture

```
┌─────────────┐
│ API Gateway │
└──────┬──────┘
       │
   ┌───┴───┬────────┬────────┬────────┐
   │       │        │        │        │
┌──▼──┐ ┌─▼───┐ ┌─▼───┐ ┌─▼───┐ ┌─▼───┐
│User │ │Auth │ │Ride │ │Driver│ │ ... │
└─────┘ └─────┘ └─────┘ └─────┘ └─────┘
   │       │        │        │        │
   └───┬───┴────────┴────────┴────────┘
       │
   ┌───▼────┐
   │Firestore│
   └─────────┘
```

## Directory Structure

```
backend/
├── shared/              # Shared code
├── services/            # Microservices
│   ├── user-service/
│   ├── driver-service/
│   ├── auth-service/
│   ├── ride-service/
│   └── api-gateway/
└── docs/                # Documentation
```

## Design Patterns

### Repository Pattern
- Abstracts data access
- Easy to swap implementations
- Testable with mocks

### Dependency Injection
- Loose coupling
- Testable components
- TSyringe container

### Factory Pattern
- Domain model creation
- DTO conversion

## Best Practices

1. **Error Handling**: Custom exceptions with proper HTTP status codes
2. **Logging**: Structured logging with Pino
3. **Validation**: Input validation at service layer
4. **Testing**: Unit, integration, and E2E tests
5. **Documentation**: API and architecture docs

