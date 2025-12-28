# @londa-rides/shared

Shared package containing types, exceptions, utilities, and constants for all Londa Rides microservices.

## Installation

```bash
npm install
npm run build
```

## Usage

```typescript
import { IUser, UserType, ValidationException, ILogger } from '@londa-rides/shared';
```

## Structure

- `types/` - TypeScript interfaces, enums, and DTOs
- `exceptions/` - Custom exception classes
- `utils/` - Shared utility functions
- `constants/` - Application constants

## Building

```bash
npm run build
```

This will compile TypeScript to JavaScript in the `dist/` directory.

