#!/bin/bash
set -e

# Timesheet Application Container Build Script
# This script builds the Docker container for the timesheet application

# Default values
CONTAINER_NAME="timesheet-app"
CONTAINER_TAG="latest"
BUILD_CONTEXT="."
DOCKERFILE="Dockerfile"

# Detect container runtime (prefer podman over docker)
if command -v podman &> /dev/null; then
    CONTAINER_RUNTIME="podman"
    echo "Using Podman as container runtime"
elif command -v docker &> /dev/null; then
    CONTAINER_RUNTIME="docker"
    echo "Using Docker as container runtime"
else
    echo "Error: Neither podman nor docker found. Please install one of them."
    exit 1
fi

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--name)
            CONTAINER_NAME="$2"
            shift 2
            ;;
        -t|--tag)
            CONTAINER_TAG="$2"
            shift 2
            ;;
        -f|--file)
            DOCKERFILE="$2"
            shift 2
            ;;
        -c|--context)
            BUILD_CONTEXT="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Build the timesheet application container"
            echo ""
            echo "Options:"
            echo "  -n, --name     Container name (default: timesheet-app)"
            echo "  -t, --tag      Container tag (default: latest)"
            echo "  -f, --file     Dockerfile path (default: Dockerfile)"
            echo "  -c, --context  Build context (default: .)"
            echo "  -h, --help     Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validate build context exists
if [ ! -d "$BUILD_CONTEXT" ]; then
    echo "Error: Build context directory '$BUILD_CONTEXT' does not exist"
    exit 1
fi

# Validate Dockerfile exists
if [ ! -f "$BUILD_CONTEXT/$DOCKERFILE" ]; then
    echo "Error: Dockerfile '$BUILD_CONTEXT/$DOCKERFILE' does not exist"
    exit 1
fi

# Change to build context directory
cd "$BUILD_CONTEXT"

echo "Building container: $CONTAINER_NAME:$CONTAINER_TAG"
echo "Using Dockerfile: $DOCKERFILE"
echo "Build context: $(pwd)"
echo "Container runtime: $CONTAINER_RUNTIME"

# Build the container
$CONTAINER_RUNTIME build \
    -t "$CONTAINER_NAME:$CONTAINER_TAG" \
    -f "$DOCKERFILE" \
    .

if [ $? -eq 0 ]; then
    echo "✅ Container build successful: $CONTAINER_NAME:$CONTAINER_TAG"
    
    # Show container size
    echo "Container size:"
    $CONTAINER_RUNTIME images | grep "$CONTAINER_NAME" | grep "$CONTAINER_TAG"
else
    echo "❌ Container build failed"
    exit 1
fi