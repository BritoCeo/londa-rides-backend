#!/bin/bash

echo "🔧 Setting up Londa App Environment Configuration..."
echo ""

# Function to update environment file
update_env_file() {
    local file_path=$1
    local content=$2
    
    echo "📝 Updating $file_path..."
    echo "$content" > "$file_path"
    echo "✅ $file_path updated successfully"
    echo ""
}

# Server environment configuration
SERVER_ENV='# Server Configuration
PORT=3001
NODE_ENV=development

# Authentication
ACCESS_TOKEN_SECRET=your-super-secret-jwt-key-change-this-in-production
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-this-in-production
EMAIL_ACTIVATION_SECRET=your-email-activation-secret-change-this-in-production

# Firebase Configuration
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/serviceAccountKey.json

# Firestore Database URL
FIRESTORE_DATABASE_URL=https://your-project-id.firebaseio.com

# Email Service (Nylas)
NYLAS_API_KEY=your-nylas-api-key
USER_GRANT_ID=your-user-grant-id

# Twilio (Optional - for SMS backup)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_SERVICE_SID=your-twilio-verify-service-sid'

# User app environment configuration
USER_ENV='EXPO_PUBLIC_SERVER_URI=http://localhost:3001/api/v1
EXPO_PUBLIC_SOCKET_URI=ws://localhost:8080'

# Driver app environment configuration
DRIVER_ENV='EXPO_PUBLIC_SERVER_URI=http://localhost:3001/api/v1
EXPO_PUBLIC_SOCKET_URI=ws://localhost:8080
EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY=AIzaSyBOWQBaF6OUQzVy9ZU05HvplCc7VrrItd8'

# Update all environment files
cd "$(dirname "$0")/.."

# Server environment
update_env_file "server/.env" "$SERVER_ENV"

# User app environment
update_env_file "user/.env" "$USER_ENV"

# Driver app environment
update_env_file "driver/.env" "$DRIVER_ENV"

echo "🎉 Environment setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. 🔥 Set up Firebase project at https://console.firebase.google.com"
echo "2. 📱 Update Firebase credentials in server/.env"
echo "3. 🔑 Generate service account key and update FIREBASE_SERVICE_ACCOUNT_KEY path"
echo "4. 🚀 Run: npm run dev:3001 (from server directory)"
echo "5. 📱 Run your React Native apps with: npx expo start"
echo ""
echo "🔧 For production deployment:"
echo "   - Replace all 'your-*' placeholders with real values"
echo "   - Set NODE_ENV=production"
echo "   - Use secure JWT secrets"
echo "" 