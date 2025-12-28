#!/bin/bash
# Bash script to install all service dependencies
# Run from backend/ directory

echo "Installing dependencies for all services..."

# Root
echo "[1/7] Installing root dependencies..."
npm install

# Shared
echo "[2/7] Installing shared package dependencies..."
cd shared && npm install && cd ..

# User Service
echo "[3/7] Installing user-service dependencies..."
cd services/user-service && npm install && cd ../..

# Driver Service
echo "[4/7] Installing driver-service dependencies..."
cd services/driver-service && npm install && cd ../..

# Auth Service
echo "[5/7] Installing auth-service dependencies..."
cd services/auth-service && npm install && cd ../..

# Ride Service
echo "[6/7] Installing ride-service dependencies..."
cd services/ride-service && npm install && cd ../..

# API Gateway
echo "[7/7] Installing api-gateway dependencies..."
cd services/api-gateway && npm install && cd ../..

echo "✅ All dependencies installed successfully!"

