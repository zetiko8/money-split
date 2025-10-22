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

# Function to wait for MySQL to be ready
wait_for_mysql() {
    echo "⏳ Waiting for MySQL to be ready..."
    local max_attempts=60
    local attempt=1
    
    # Give MySQL a moment to start
    sleep 2
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec $DOCKER_CONTAINER_NAME mysqladmin ping -h localhost -u root -p$MYSQL_PASSWORD --silent 2>/dev/null; then
            echo "✅ MySQL is ready!"
            # Extra safety: wait a bit more to ensure it's fully ready
            sleep 2
            return 0
        fi
        
        if [ $((attempt % 5)) -eq 0 ]; then
            echo "   Attempt $attempt/$max_attempts - MySQL not ready yet..."
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    
    echo "❌ MySQL failed to become ready after $max_attempts seconds"
    return 1
}

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
        if wait_for_mysql; then
            exit 0
        else
            exit 1
        fi
    else
        echo "🔄 Starting existing container..."
        docker start $DOCKER_CONTAINER_NAME
        if [ $? -eq 0 ]; then
            echo "✅ Container started"
            if wait_for_mysql; then
                exit 0
            else
                exit 1
            fi
        else
            echo "❌ Failed to start container"
            exit 1
        fi
    fi
fi

# Create and start new container
echo "🆕 Creating new MySQL container..."
docker run -d \
    --name $DOCKER_CONTAINER_NAME \
    -e MYSQL_ROOT_PASSWORD=$MYSQL_PASSWORD \
    -e MYSQL_DATABASE=$MYSQL_DATABASE \
    -p $MYSQL_PORT:3306 \
    --health-cmd='mysqladmin ping -h localhost -u root -p$MYSQL_ROOT_PASSWORD || exit 1' \
    --health-interval=2s \
    --health-timeout=2s \
    --health-retries=30 \
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
    if wait_for_mysql; then
        exit 0
    else
        exit 1
    fi
else
    echo "❌ Failed to start MySQL container"
    exit 1
fi
