const fs = require('fs');
const path = require('path');

function cleanupMongoDB() {
  console.log('🧹 Cleaning up MongoDB dependencies...');
  
  try {
    // Remove Prisma schema file
    const prismaSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
    if (fs.existsSync(prismaSchemaPath)) {
      fs.unlinkSync(prismaSchemaPath);
      console.log('✅ Removed prisma/schema.prisma');
    }
    
    // Remove Prisma directory
    const prismaDir = path.join(__dirname, '..', 'prisma');
    if (fs.existsSync(prismaDir)) {
      fs.rmSync(prismaDir, { recursive: true, force: true });
      console.log('✅ Removed prisma/ directory');
    }
    
    // Remove MongoDB model files
    const modelsDir = path.join(__dirname, '..', 'models');
    if (fs.existsSync(modelsDir)) {
      const modelFiles = fs.readdirSync(modelsDir);
      modelFiles.forEach(file => {
        if (file.endsWith('.model.ts')) {
          fs.unlinkSync(path.join(modelsDir, file));
          console.log(`✅ Removed ${file}`);
        }
      });
    }
    
    // Remove database utility files
    const utilsDir = path.join(__dirname, '..', 'utils');
    const dbFiles = ['database.ts', 'mongodb.ts', 'mongodb-prisma.ts', 'prisma.ts'];
    
    dbFiles.forEach(file => {
      const filePath = path.join(utilsDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Removed utils/${file}`);
      }
    });
    
    // Update package.json to remove MongoDB dependencies
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Remove MongoDB and Prisma dependencies
      const dependenciesToRemove = [
        'mongodb',
        '@prisma/client',
        'prisma'
      ];
      
      dependenciesToRemove.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          delete packageJson.dependencies[dep];
          console.log(`✅ Removed dependency: ${dep}`);
        }
        if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
          delete packageJson.devDependencies[dep];
          console.log(`✅ Removed dev dependency: ${dep}`);
        }
      });
      
      // Write updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Updated package.json');
    }
    
    console.log('🎉 Cleanup completed successfully!');
    console.log('📝 Next steps:');
    console.log('1. Run: npm install');
    console.log('2. Test your application');
    console.log('3. Remove any remaining MongoDB references in your code');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Run cleanup if this file is executed directly
if (require.main === module) {
  cleanupMongoDB();
}

module.exports = { cleanupMongoDB };
