# CIRE Explorer

CIRE Explorer is a specialized version of Compiler Explorer configured to work with CIRE, a tool for providing rigid error bounds introduced by floating-point roundoff in computations.

## Quick Start

### Prerequisites

- Node.js 20 or higher
- Clang/LLVM compiler
- `curl` (for automatic CIRE setup)

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/caydenlund/cire-explorer
   cd cire-explorer
   npm install
   ```

2. **Bootstrap CIRE (recommended):**
   The easiest way to get started is to use the bootstrap script, which automatically downloads the latest CIRE binary:
   ```bash
   ./etc/scripts/bootstrap-cire.sh
   ```

   This script will:
   - Download the latest `CIRE_LLVM` binary from [GitHub releases](https://github.com/caydenlund/CIRE/releases)
   - Save it to `tools/cire/CIRE_LLVM`
   - Configure `etc/config/c.local.properties` with the correct path

3. **Configure your compiler (optional):**
   If needed, you can customize your local configuration in `etc/config/c.local.properties`:
   ```properties
   # Point to your clang compiler (optional, defaults to system clang)
   compiler.cclangdefault.exe=/path/to/your/clang
   ```

4. **Build and run:**
   ```bash
   npm start
   ```

5. **Access the interface:**
   Open [http://localhost:10240](http://localhost:10240) in your browser.

### Manual CIRE Setup

If you prefer to build CIRE from source or use a custom binary:

1. Build or obtain the `CIRE_LLVM` binary
2. Create `etc/config/c.local.properties` with:
   ```properties
   tools.cire.exe=/path/to/your/CIRE_LLVM
   ```

### Troubleshooting

**CIRE not appearing**: Check that `tools.cire.exe` points to a valid executable and the path is absolute.

**Compilation errors**: Verify your clang path in `compiler.cclangdefault.exe` is correct.

**Build issues**: Ensure Node.js 20+ is installed and run `npm install` to update dependencies.

## Docker Setup

The easiest way to run CIRE Explorer with all dependencies included is using Docker.

### Quick Start with Docker

```bash
# Using docker-compose (recommended)
docker-compose up

# Or build and run manually from parent directory
cd /path/to/parent  # directory containing CIRE/, cire-explorer/, and llvm-upstream/
docker build -t cire-explorer:latest -f cire-explorer/Dockerfile .
docker run -p 10240:10240 cire-explorer:latest
```

Then open [http://localhost:10240](http://localhost:10240) in your browser.

### What's Included

The Docker image includes:
- **CIRE Explorer Web UI** - Interactive compiler explorer interface
- **CIRE** - Complete error analysis toolchain
- **LLVM 22.0.0git** - Full clang/LLVM toolchain (from llvm-upstream)
- All dependencies pre-configured

### Build Script

```bash
# From cire-explorer directory
./docker-build.sh                    # Build local image
./docker-build.sh --tag v1.0         # Build with specific tag
./docker-build.sh --push             # Build and push to registry
```

See [DOCKER.md](DOCKER.md) for complete Docker documentation.
