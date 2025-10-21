#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
ENV_FILE="$ROOT_DIR/.env"

# Load environment variables
if [ -f "$ENV_FILE" ]; then
    export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
else
    echo "❌ .env file not found!"
    echo "   Expected location: $ENV_FILE"
    echo "   Run 'npm run generate-env' first"
    exit 1
fi

# Set defaults if not in .env
MYSQL_PASSWORD=${MYSQL_PASSWORD:-anze123}
MYSQL_DATABASE=${MYSQL_DATABASE:-main}
MYSQL_PORT=${MYSQL_PORT:-13308}
DOCKER_CONTAINER_NAME=${DOCKER_CONTAINER_NAME:-money-split-db-local}

echo "🐳 Starting MySQL container..."
echo "   Container: $DOCKER_CONTAINER_NAME"
echo "   Port: $MYSQL_PORT"
echo "   Database: $MYSQL_DATABASE"
echo ""

# Check if container already exists
if docker ps -a --format '{{.Names}}' | grep -q "^${DOCKER_CONTAINER_NAME}$"; then
    echo "⚠️  Container '$DOCKER_CONTAINER_NAME' already exists"
    
    # Check if it's running
    if docker ps --format '{{.Names}}' | grep -q "^${DOCKER_CONTAINER_NAME}$"; then
        echo "✅ Container is already running"
        exit 0
    else
        echo "🔄 Starting existing container..."
        docker start $DOCKER_CONTAINER_NAME
        echo "✅ Container started"
        exit 0
    fi
fi

# Create and start new container
echo "🆕 Creating new MySQL container..."
docker run -d \
    --name $DOCKER_CONTAINER_NAME \
    -e MYSQL_ROOT_PASSWORD=$MYSQL_PASSWORD \
    -e MYSQL_DATABASE=$MYSQL_DATABASE \
    -p $MYSQL_PORT:3306 \
    mysql:latest

if [ $? -eq 0 ]; then
    echo "✅ MySQL container started successfully!"
    echo ""
    echo "📋 Connection details:"
    echo "   Host: localhost"
    echo "   Port: $MYSQL_PORT"
    echo "   Database: $MYSQL_DATABASE"
    echo "   User: root"
    echo "   Password: (from .env)"
    echo ""
    echo "⏳ Waiting for MySQL to be ready..."
    sleep 5
    echo "✅ MySQL should be ready now"
else
    echo "❌ Failed to start MySQL container"
    exit 1
fi
