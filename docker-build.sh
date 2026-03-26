#!/bin/bash
# Build script for CIRE Explorer Docker image

set -e

# Default values
IMAGE_NAME="cire-explorer"
IMAGE_TAG="latest"
REGISTRY=""
PUSH=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --name)
            IMAGE_NAME="$2"
            shift 2
            ;;
        --tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        --registry)
            REGISTRY="$2"
            shift 2
            ;;
        --push)
            PUSH=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --name NAME        Docker image name (default: cire-explorer)"
            echo "  --tag TAG          Docker image tag (default: latest)"
            echo "  --registry REG     Registry to push to (e.g., ghcr.io/username)"
            echo "  --push             Push image after building"
            echo "  --help             Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0"
            echo "  $0 --tag v1.0"
            echo "  $0 --registry registry.example.com/myorg --tag v1.0 --push"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Construct full image name
if [ -n "$REGISTRY" ]; then
    FULL_IMAGE="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
else
    FULL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"
fi

echo "========================================="
echo "Building CIRE Explorer Docker Image"
echo "========================================="
echo "Image: $FULL_IMAGE"
echo "Push: $PUSH"
echo ""

# Check that we're in the cire-explorer directory
if [ ! -f "package.json" ]; then
    echo "Error: This script must be run from the cire-explorer directory"
    exit 1
fi

# Check if cire base image exists
if ! docker image inspect cire:latest >/dev/null 2>&1; then
    echo "WARNING: cire:latest base image not found!"
    echo ""
    echo "The CIRE Explorer image builds on top of the cire:latest base image."
    echo "Please build the CIRE image first:"
    echo ""
    echo "  cd ../CIRE"
    echo "  ./docker-build.sh"
    echo ""
    echo "Then return here and run this script again."
    echo ""
    exit 1
fi

# Build the image
echo "Building image..."
DOCKER_BUILDKIT=1 docker build --progress=plain -t "$FULL_IMAGE" .

echo ""
echo "Build complete!"
echo "Image: $FULL_IMAGE"
echo ""

# Show image size
echo "Image size:"
docker images "$FULL_IMAGE" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
echo ""

# Push if requested
if [ "$PUSH" = true ]; then
    echo "Pushing to registry..."
    docker push "$FULL_IMAGE"
    echo "Push complete!"
fi

echo ""
echo "========================================="
echo "Usage examples:"
echo "========================================="
echo ""
echo "Run CIRE Explorer:"
echo "  docker run -p 10240:10240 $FULL_IMAGE"
echo "  Then open http://localhost:10240"
echo ""
echo "Run with custom port:"
echo "  docker run -p 8080:10240 $FULL_IMAGE"
echo ""
echo "Interactive shell:"
echo "  docker run --rm -it --entrypoint /bin/bash $FULL_IMAGE"
echo ""
echo "Test CIRE directly:"
echo "  docker run --rm $FULL_IMAGE bash -c 'CIRE_LLVM --help'"
echo ""
echo "Test clang:"
echo "  docker run --rm $FULL_IMAGE bash -c 'clang --version'"
echo ""
