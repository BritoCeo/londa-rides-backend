# Legacy Code Cleanup Guide

## Files to Remove

### Prisma Artifacts
- `server/prisma/schema.prisma` - No longer used (migrated to Firestore)
- `server/@types/prisma.d.ts` - Prisma types no longer needed

### Old Service Files
- `server/utils/firestore-service-old.ts` - Legacy file
- `server/utils/firestore-service-clean.ts` - Unused variant

### Build Artifacts
- `server/build/` - Should be in .gitignore, remove from repo

### Test Files (Reorganize)
- Move all `server/test-*.js` files to `server/tests/`
- Organize into `tests/unit/`, `tests/integration/`, `tests/e2e/`

## Migration Notes

### Old Structure → New Structure

**Controllers:**
- Old: `server/controllers/user.controller.ts`
- New: `services/user-service/src/controllers/UserController.ts`

**Services:**
- Old: `server/utils/firestore-service.ts`
- New: `services/*/src/services/*Service.ts`

**Models:**
- Old: Prisma models
- New: `services/*/src/models/*.ts` (OOP classes)

## Cleanup Steps

1. Remove Prisma dependencies from `server/package.json`
2. Remove old controller files after migration
3. Remove old utility files after migration
4. Update imports in remaining files
5. Update documentation

## Backward Compatibility

During migration, keep old endpoints working until new services are fully deployed and tested.

