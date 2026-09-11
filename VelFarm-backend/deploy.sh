#!/bin/bash

# Deployment script for FertiFarm Backend
echo "🚀 Starting FertiFarm Backend Deployment..."

# Set environment variables
export NODE_ENV=production
export PORT=5001

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
NODE_ENV=production
PORT=5001
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
EOF
    echo "⚠️  Please update .env file with your actual MongoDB URI and JWT secret"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Stop any existing PM2 processes
echo "🛑 Stopping existing processes..."
pm2 stop all
pm2 delete all

# Start the application with PM2
echo "▶️  Starting application on port 5001..."
pm2 start ecosystem.config.js --env production

# Show status
echo "📊 Application status:"
pm2 list

# Show logs
echo "📋 Recent logs:"
pm2 logs sih-backend --lines 10

echo "✅ Deployment complete!"
echo "🌐 Your backend should be running on port 5001"
echo "🔗 Test with: curl http://localhost:5001/api/health"
