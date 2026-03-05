# CIRE Explorer Docker Container

This document describes how to build, publish, and use the CIRE Explorer Docker container.

## Overview

The CIRE Explorer Docker container includes:
- **CIRE Explorer Web UI**: Interactive compiler explorer interface
- **CIRE Tools**: Error analysis tools (both SATIRE and LLVM frontends)
- **LLVM Toolchain**: Complete LLVM with `clang`, `clang++`, and LLVM tools
- All necessary runtime libraries and dependencies

This allows you to analyze C/C++ programs with CIRE through an interactive web interface without installing any dependencies locally.

## Architecture

CIRE Explorer is built as a **layered Docker image**:
1. **Base layer** (`cire:latest`): Contains CIRE, LLVM, and IBEX
2. **UI layer** (`cire-explorer:latest`): Adds Node.js and Compiler Explorer web interface

This architecture allows:
- Publishing standalone `cire` images for command-line use
- Publishing `cire-explorer` images for web-based interactive use
- Faster rebuilds when only the UI changes (no need to recompile LLVM)

## Quick Start

### Pull from Registry (if published)

```bash
docker pull YOUR_REGISTRY/cire-explorer:latest
```

### Build Locally

**Prerequisites**: You must build the `cire:latest` base image first.

```bash
# Step 1: Build the CIRE base image (contains LLVM, IBEX, CIRE)
cd /path/to/CIRE
./docker-build.sh
# OR: docker build -t cire:latest .

# Step 2: Build the CIRE Explorer image (adds web UI)
cd /path/to/cire-explorer
./docker-build.sh
# OR: docker build -t cire-explorer:latest .
```

Each Dockerfile is **fully independent** and builds from its own directory. No parent directory structure or sibling directories required!

## Usage Examples

### 1. Run CIRE Explorer Web Interface

```bash
docker run -p 10240:10240 cire-explorer:latest
```

Then open http://localhost:10240 in your browser.

### 2. Run on Custom Port

```bash
docker run -p 8080:10240 cire-explorer:latest
```

Then open http://localhost:8080 in your browser.

### 3. Interactive Shell

```bash
docker run --rm -it --entrypoint /bin/bash cire-explorer:latest
```

Inside the container, you can use:
- `CIRE_LLVM` - Analyze LLVM IR files
- `CIRE` - Analyze SATIRE programs
- `clang` / `clang++` - Compile C/C++ code
- `llvm-dis`, `llvm-as`, `opt`, `llc` - LLVM tools
- Node.js application at `/app`

### 4. Test CIRE Directly

```bash
docker run --rm cire-explorer:latest bash -c "CIRE_LLVM --help"
```

### 5. Test LLVM Version

```bash
docker run --rm cire-explorer:latest bash -c "clang --version"
```

### 6. Using Docker Compose

Create a `docker-compose.yml` file in the cire-explorer directory:

```yaml
version: '3.8'

services:
  cire-explorer:
    build: .
    ports:
      - "10240:10240"
    environment:
      - NODE_ENV=production
    volumes:
      - ./workspace:/workspace
    restart: unless-stopped
```

Then run:

```bash
docker-compose up -d
```

## Building and Publishing

### Build Script Options

```bash
./docker-build.sh --help
```

Options:
- `--name NAME`: Docker image name (default: `cire-explorer`)
- `--tag TAG`: Docker image tag (default: `latest`)
- `--registry REG`: Registry URL (e.g., `ghcr.io/myorg`)
- `--push`: Push to registry after building

### Examples

Build and tag as `v1.0`:

```bash
./docker-build.sh --tag v1.0
```

Build and push to a container registry:

```bash
./docker-build.sh \
  --registry YOUR_REGISTRY/YOUR_USERNAME \
  --tag latest \
  --push
```

Build multiple tags:

```bash
./docker-build.sh --tag v1.0.0
./docker-build.sh --tag v1.0
./docker-build.sh --tag latest
```

### Publishing to a Container Registry

**Important**: When publishing, you should publish both the base `cire` image and the `cire-explorer` image:

```bash
# Step 1: Build and publish the CIRE base image
cd /path/to/CIRE
./docker-build.sh --registry YOUR_REGISTRY/YOUR_USERNAME --tag latest --push

# Step 2: Build and publish the CIRE Explorer image
cd /path/to/cire-explorer
./docker-build.sh --registry YOUR_REGISTRY/YOUR_USERNAME --tag latest --push
```

This allows users to:
- Pull `cire:latest` for command-line use
- Pull `cire-explorer:latest` for web UI (which includes everything from `cire:latest`)

#### Docker Hub

1. **Authenticate**:

   ```bash
   docker login
   ```

2. **Build and push**:

   ```bash
   ./docker-build.sh \
     --registry YOUR_DOCKERHUB_USERNAME \
     --tag latest \
     --push
   ```

#### GitHub Container Registry (ghcr.io)

1. **Authenticate**:

   ```bash
   echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
   ```

2. **Build and push**:

   ```bash
   ./docker-build.sh \
     --registry ghcr.io/YOUR_USERNAME \
     --tag latest \
     --push
   ```

#### Other Registries (GitLab, Harbor, AWS ECR, etc.)

1. **Authenticate to your registry**:

   ```bash
   # Generic
   docker login YOUR_REGISTRY_URL

   # AWS ECR example
   aws ecr get-login-password --region us-east-1 | \
     docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

   # GitLab example
   docker login registry.gitlab.com -u YOUR_USERNAME -p YOUR_TOKEN
   ```

2. **Build and push**:

   ```bash
   ./docker-build.sh \
     --registry YOUR_REGISTRY_URL/YOUR_USERNAME \
     --tag latest \
     --push
   ```

## Advanced Usage

### Multi-Architecture Builds

Build for multiple platforms (requires buildx):

```bash
cd /path/to/cire-explorer
docker buildx create --use
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t cire-explorer:latest \
  --push \
  .
```

### Custom LLVM/IBEX Versions

To use different LLVM or IBEX versions, customize the base `cire` image:

1. Edit `CIRE/Dockerfile` and change the version ARGs:
   ```dockerfile
   ARG LLVM_VERSION=18.1.8
   ARG IBEX_VERSION=2.8.9
   ```

2. Rebuild both images:
   ```bash
   # Rebuild CIRE base image with custom versions
   cd /path/to/CIRE
   docker build --build-arg LLVM_VERSION=19.1.0 -t cire:latest .

   # Rebuild CIRE Explorer (inherits the custom LLVM version)
   cd /path/to/cire-explorer
   ./docker-build.sh
   ```

### Development Mode with Live Reload

For development, you can mount your local source:

```bash
docker run -p 10240:10240 \
  -v $(pwd)/cire-explorer:/app:ro \
  -e NODE_ENV=DEV \
  cire-explorer:latest \
  node --no-warnings=ExperimentalWarning --import=tsx /app/app.ts
```

### Extracting Binaries

To extract compiled binaries from the base CIRE image:

```bash
# Extract from the cire:latest base image
docker create --name temp cire:latest
docker cp temp:/usr/local/bin/CIRE_LLVM ./
docker cp temp:/usr/local/bin/CIRE ./
docker cp temp:/usr/local/bin/clang ./
docker rm temp
```

Or extract from the CIRE build stage during build:

```bash
cd /path/to/CIRE
docker build --target cire-builder -t cire-builder .
docker create --name temp cire-builder
docker cp temp:/workspace/cire/build/CIRE_LLVM ./
docker cp temp:/workspace/cire/build/CIRE ./
docker rm temp
```

## Troubleshooting

### Build fails with "cire:latest not found"

The CIRE Explorer image requires the base `cire:latest` image. Build it first:

```bash
cd /path/to/CIRE
./docker-build.sh
```

Then rebuild CIRE Explorer:

```bash
cd /path/to/cire-explorer
./docker-build.sh
```

### Build fails with "No such file or directory"

Make sure you're in the cire-explorer directory:

```bash
cd /path/to/cire-explorer
ls -l  # Should show package.json, Dockerfile, etc.
docker build -t cire-explorer:latest .
```

### Build fails with "out of memory"

Increase Docker's memory limit or reduce parallel jobs in the Dockerfile:

```dockerfile
-DLLVM_PARALLEL_LINK_JOBS=1
```

### Container can't find libraries

Make sure the `LD_LIBRARY_PATH` is set correctly. Check with:

```bash
docker run --rm cire-explorer:latest bash -c 'echo $LD_LIBRARY_PATH'
```

### Permission issues with mounted volumes

If running on Linux, you may need to match the container user to your host user:

```bash
docker run -p 10240:10240 --user $(id -u):$(id -g) cire-explorer:latest
```

### Web interface not accessible

1. Check the container is running:
   ```bash
   docker ps
   ```

2. Check logs:
   ```bash
   docker logs <container-id>
   ```

3. Verify port mapping:
   ```bash
   docker port <container-id>
   ```

4. Test with curl inside container:
   ```bash
   docker exec <container-id> curl http://localhost:10240
   ```

### CIRE analysis not working

Verify CIRE is properly configured:

```bash
docker run --rm cire-explorer:latest bash -c "cat /app/etc/config/c.local.properties"
```

Should show:
```
tools.cire.exe=/usr/local/bin/CIRE_LLVM
compiler.cclangdefault.exe=/usr/local/bin/clang
```

## Container Details

### Included Tools

- **CIRE_LLVM** - CIRE with LLVM IR frontend at `/usr/local/bin/CIRE_LLVM`
- **CIRE** - CIRE with SATIRE frontend at `/usr/local/bin/CIRE`
- **clang/clang++** - C/C++ compiler (LLVM 22.0.0git) at `/usr/local/bin/clang`
- **llvm-as** - LLVM assembler
- **llvm-dis** - LLVM disassembler
- **opt** - LLVM optimizer
- **llc** - LLVM static compiler
- **Node.js 20** - JavaScript runtime for Compiler Explorer

### Ports

- `10240` - CIRE Explorer web interface (default Compiler Explorer port)

### Image Size

The final runtime image is approximately **1.2GB - 1.5GB** depending on configuration.

Layered architecture breakdown:
- **Base `cire:latest` image**: ~600MB-800MB (contains LLVM, IBEX, CIRE)
- **Explorer layer additions**: ~400MB-600MB (Node.js + web UI)
- **Final `cire-explorer:latest`**: ~1.2GB-1.3GB total

Benefits of layered approach:
- When only UI code changes, only rebuild the small explorer layer
- When CIRE code changes, rebuild base image and explorer layer reuses it
- Can publish both images independently for different use cases

### Base Image

Ubuntu 22.04 LTS (Jammy Jellyfish)

### Configuration Files

Configuration is stored in `/app/etc/config/`:
- `c.local.properties` - Local configuration (auto-generated)
- Other `.properties` files - Global configuration

## Production Deployment

### Docker Compose Production Setup

```yaml
version: '3.8'

services:
  cire-explorer:
    image: YOUR_REGISTRY/cire-explorer:latest
    ports:
      - "10240:10240"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:10240/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cire-explorer
spec:
  replicas: 2
  selector:
    matchLabels:
      app: cire-explorer
  template:
    metadata:
      labels:
        app: cire-explorer
    spec:
      containers:
      - name: cire-explorer
        image: YOUR_REGISTRY/cire-explorer:latest
        ports:
        - containerPort: 10240
        livenessProbe:
          httpGet:
            path: /
            port: 10240
          initialDelaySeconds: 40
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /
            port: 10240
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: cire-explorer
spec:
  selector:
    app: cire-explorer
  ports:
  - port: 80
    targetPort: 10240
  type: LoadBalancer
```

## License

Same as CIRE Explorer project license.

## Support

For issues with the Docker container, please open an issue on the CIRE Explorer repository.

## Related Documentation

- [CIRE Docker Documentation](../CIRE/DOCKER.md) - Standalone CIRE container
- [CIRE Explorer README](README.md) - Local development setup
- [Compiler Explorer Documentation](https://github.com/compiler-explorer/compiler-explorer) - Upstream project
