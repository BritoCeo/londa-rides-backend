# Quick Start Guide

## 📍 Where to Run Commands

### Root Scripts Location

Run root scripts from the **`backend/`** directory (where `package.json` is located):

```
C:\MyProjects\londa-rides\Londa-Rides\backend>
```

This is the root directory that contains:
- `package.json` (root)
- `shared/`
- `services/`
- `docs/`

## 🚀 Step-by-Step Installation

### Step 1: Navigate to Backend Root

```powershell
cd C:\MyProjects\londa-rides\Londa-Rides\backend
```

### Step 2: Install All Dependencies

From the **backend/** directory, run:

```powershell
npm run install:all
```

This will install dependencies for:
- Root package
- Shared package
- All microservices (user, driver, auth, ride, api-gateway)

### Step 3: Build Shared Package

Still in the **backend/** directory:

```powershell
npm run build:shared
```

Or manually:
```powershell
cd shared
npm run build
cd ..
```

### Step 4: Run Services

From the **backend/** directory:

**Option A - Run all services:**
```powershell
npm run dev:all
```

**Option B - Run individually:**
```powershell
npm run dev:user      # Terminal 1
npm run dev:driver    # Terminal 2
npm run dev:auth      # Terminal 3
npm run dev:ride      # Terminal 4
npm run dev:gateway   # Terminal 5
```

## 📂 Directory Structure

```
backend/                    ← Run root scripts HERE
├── package.json           ← Root package.json with scripts
├── shared/
│   └── package.json
├── services/
│   ├── user-service/
│   │   └── package.json
│   ├── driver-service/
│   │   └── package.json
│   ├── auth-service/
│   │   └── package.json
│   ├── ride-service/
│   │   └── package.json
│   └── api-gateway/
│       └── package.json
└── docs/
```

## ✅ Quick Command Reference

All commands run from **`backend/`** directory:

```powershell
# Install everything
npm run install:all

# Build shared package
npm run build:shared

# Run all services
npm run dev:all

# Run individual services
npm run dev:user
npm run dev:driver
npm run dev:auth
npm run dev:ride
npm run dev:gateway

# Build all services
npm run build:all

# Clean build artifacts
npm run clean
```

## 🎯 Example Session

```powershell
# 1. Navigate to backend root
PS C:\MyProjects\londa-rides\Londa-Rides\backend> 

# 2. Install all dependencies
PS C:\MyProjects\londa-rides\Londa-Rides\backend> npm run install:all

# 3. Build shared package
PS C:\MyProjects\londa-rides\Londa-Rides\backend> npm run build:shared

# 4. Run all services
PS C:\MyProjects\londa-rides\Londa-Rides\backend> npm run dev:all
```

## ⚠️ Important Notes

- **Always run root scripts from `backend/` directory**
- **Build shared package before running services**
- **Each service needs its own `.env` file** (see SETUP_AND_RUN_GUIDE.md)

