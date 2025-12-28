# Londa Rides Backend

Enterprise-grade microservices backend for Londa Rides, built with OOP, Clean Code, MVC patterns, and best practices.

## 🏗️ Architecture

- **Microservices**: Independent, scalable services
- **OOP**: Object-Oriented Programming with SOLID principles
- **Clean Code**: Meaningful names, small functions, DRY
- **MVC**: Model-View-Controller pattern
- **TypeScript**: Full type safety
- **Firestore**: NoSQL database

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Build Shared Package

```bash
npm run build:shared
```

### 3. Configure Environment

Create `.env` files for each service (see `SETUP_AND_RUN_GUIDE.md`)

### 4. Run All Services

```bash
npm run dev:all
```

Or run services individually:

```bash
npm run dev:user      # User Service (port 8002)
npm run dev:driver    # Driver Service (port 8003)
npm run dev:auth      # Auth Service (port 8001)
npm run dev:ride      # Ride Service (port 8004)
npm run dev:gateway   # API Gateway (port 8000)
```

## 📦 Services

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 8000 | Routes requests to microservices |
| Auth Service | 8001 | Authentication & authorization |
| User Service | 8002 | User management |
| Driver Service | 8003 | Driver management |
| Ride Service | 8004 | Ride booking & management |

## 📁 Project Structure

```
backend/
├── shared/              # Shared types, utilities, base classes
├── services/            # Microservices
│   ├── user-service/
│   ├── driver-service/
│   ├── auth-service/
│   ├── ride-service/
│   └── api-gateway/
└── docs/                # Documentation
```

## 📚 Documentation

- **Setup Guide**: `SETUP_AND_RUN_GUIDE.md` - Complete setup instructions
- **API Docs**: `docs/api/API_DOCUMENTATION.md` - API endpoints
- **Architecture**: `docs/architecture/ARCHITECTURE.md` - Architecture details
- **Implementation**: `IMPLEMENTATION_SUMMARY.md` - What was implemented

## 🧪 Testing

```bash
npm run test:shared
```

## 🔧 Development

### Build

```bash
npm run build:all
```

### Clean

```bash
npm run clean
```

## 🌐 API Endpoints

All API requests go through the API Gateway:

```
http://localhost:8000/api/v1
```

See `docs/api/API_DOCUMENTATION.md` for complete API reference.

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: Firebase Firestore
- **DI**: TSyringe
- **Logging**: Pino
- **Testing**: Jest

## 📝 Environment Variables

Each service requires its own `.env` file. See `SETUP_AND_RUN_GUIDE.md` for details.

## 🤝 Contributing

1. Follow OOP principles
2. Maintain Clean Code standards
3. Write tests
4. Update documentation

## 📄 License

ISC

---

For detailed setup instructions, see `SETUP_AND_RUN_GUIDE.md`

