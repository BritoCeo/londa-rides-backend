# PowerShell script to install all service dependencies
# Run from backend/ directory

Write-Host "Installing dependencies for all services..." -ForegroundColor Cyan

# Root
Write-Host "`n[1/6] Installing root dependencies..." -ForegroundColor Yellow
npm install

# Shared
Write-Host "`n[2/6] Installing shared package dependencies..." -ForegroundColor Yellow
cd shared
npm install
cd ..

# User Service
Write-Host "`n[3/6] Installing user-service dependencies..." -ForegroundColor Yellow
cd services/user-service
npm install
cd ../..

# Driver Service
Write-Host "`n[4/6] Installing driver-service dependencies..." -ForegroundColor Yellow
cd services/driver-service
npm install
cd ../..

# Auth Service
Write-Host "`n[5/6] Installing auth-service dependencies..." -ForegroundColor Yellow
cd services/auth-service
npm install
cd ../..

# Ride Service
Write-Host "`n[6/6] Installing ride-service dependencies..." -ForegroundColor Yellow
cd services/ride-service
npm install
cd ../..

# API Gateway
Write-Host "`n[7/7] Installing api-gateway dependencies..." -ForegroundColor Yellow
cd services/api-gateway
npm install
cd ../..

Write-Host "`n✅ All dependencies installed successfully!" -ForegroundColor Green

