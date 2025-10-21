#!/bin/bash

# Setup and test script
set -e  # Exit on error

echo "🔧 Setting up environment..."
npm run generate-env

echo "🐳 Starting database..."
npm run docker:start
sleep 5  # Wait for MySQL to be ready

echo "🗄️ Setting up database..."
npm run db:fresh

echo "👤 Creating test admin..."
npm run create-test-admin

echo "🚀 Starting API..."
npm run dev:data-provider &
API_PID=$!
sleep 3  # Wait for API to start

echo "🧪 Running tests..."
npm run test:data-provider

echo "🛑 Stopping API..."
kill $API_PID

echo "✅ All done!"