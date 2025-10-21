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
    exit 1
fi

DOCKER_CONTAINER_NAME=${DOCKER_CONTAINER_NAME:-money-split-db-local}

echo "🗑️  Removing MySQL container..."
echo "   Container: $DOCKER_CONTAINER_NAME"
echo ""

# Check if container exists
if ! docker ps -a --format '{{.Names}}' | grep -q "^${DOCKER_CONTAINER_NAME}$"; then
    echo "⚠️  Container '$DOCKER_CONTAINER_NAME' does not exist"
    exit 0
fi

# Stop the container if running
if docker ps --format '{{.Names}}' | grep -q "^${DOCKER_CONTAINER_NAME}$"; then
    echo "🛑 Stopping container..."
    docker stop $DOCKER_CONTAINER_NAME
fi

# Remove the container
echo "🗑️  Removing container..."
docker rm $DOCKER_CONTAINER_NAME

if [ $? -eq 0 ]; then
    echo "✅ Container removed successfully"
else
    echo "❌ Failed to remove container"
    exit 1
fi
