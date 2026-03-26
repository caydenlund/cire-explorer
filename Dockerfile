# Multi-stage Dockerfile for CIRE Explorer
# Builds on top of the cire:latest base image
# Adds Compiler Explorer UI on top of CIRE + LLVM
#
# Prerequisites:
#   - Build cire image first: cd ../CIRE && ./docker-build.sh
#
# Usage:
#   docker build -t cire-explorer:latest .
#   docker run -p 10240:10240 cire-explorer:latest

# ============================================================================
# Stage 1: Build CIRE Explorer (Node.js application)
# ============================================================================
FROM ubuntu:22.04 AS explorer-builder

ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js 20 and git (needed for webpack build)
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --production=false

# Copy source code
COPY . ./

# Build webpack assets
RUN npm run webpack

# ============================================================================
# Stage 2: Pull FPChecker from pre-built image
# ============================================================================
FROM caydenlund/fpchecker:latest AS fpchecker

# ============================================================================
# Stage 3: Runtime Image - CIRE base + Explorer UI + FPChecker
# ============================================================================
FROM cire:latest

ENV DEBIAN_FRONTEND=noninteractive

LABEL maintainer="CIRE Team"
LABEL description="CIRE Explorer - Interactive Compiler Explorer with CIRE error analysis, LLVM, and FPChecker"
LABEL version="1.0"

ENTRYPOINT []

# Install Node.js runtime, Python, curl, and C++ development tools for FPChecker
RUN apt-get update && apt-get install -y \
    curl \
    binutils \
    python3 \
    python3-pip \
    build-essential \
    libstdc++-11-dev \
    cmake \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies for FPChecker
RUN pip3 install matplotlib

# Copy CIRE Explorer application
COPY --from=explorer-builder /app /app

# Copy FPChecker installation from fpchecker image
COPY --from=fpchecker /opt/fpchecker /opt/fpchecker
COPY --from=fpchecker /opt/llvm /opt/fpchecker-llvm

# Fix FPChecker wrapper scripts to use Docker paths instead of build-time paths
RUN sed -i "s|export FPC_COMPILER='.*'|export FPC_COMPILER='/opt/fpchecker-llvm/bin/clang'|g" /opt/fpchecker/cpu_checking/cc_frontend.sh && \
    sed -i "s|export FPC_COMPILER='.*'|export FPC_COMPILER='/opt/fpchecker-llvm/bin/clang++'|g" /opt/fpchecker/cpu_checking/cxx_frontend.sh && \
    sed -i 's|EXTRA_FLAGS=".*"|EXTRA_FLAGS=""|g' /opt/fpchecker/cpu_checking/cc_frontend.sh && \
    sed -i 's|EXTRA_FLAGS=".*"|EXTRA_FLAGS=""|g' /opt/fpchecker/cpu_checking/cxx_frontend.sh && \
    ln -s /opt/fpchecker/lib64 /opt/fpchecker/lib

# Add FPChecker to PATH
ENV PATH="/opt/fpchecker/bin:/opt/fpchecker-llvm/bin:${PATH}"
ENV LD_LIBRARY_PATH="/opt/fpchecker/lib64:/opt/fpchecker-llvm/lib:${LD_LIBRARY_PATH}"

WORKDIR /app

# Create configuration directory
RUN mkdir -p /app/etc/config

# Create local configuration for CIRE, clang, and FPChecker
RUN echo "# CIRE Explorer Configuration" > /app/etc/config/c.local.properties && \
    echo "" >> /app/etc/config/c.local.properties && \
    echo "# Compiler configuration" >> /app/etc/config/c.local.properties && \
    echo "compiler.cclangdefault.exe=/usr/local/bin/clang" >> /app/etc/config/c.local.properties && \
    echo "" >> /app/etc/config/c.local.properties && \
    echo "# Tools configuration" >> /app/etc/config/c.local.properties && \
    echo "tools=cire:fpchecker" >> /app/etc/config/c.local.properties && \
    echo "" >> /app/etc/config/c.local.properties && \
    echo "# CIRE tool" >> /app/etc/config/c.local.properties && \
    echo "tools.cire.exe=/usr/local/bin/CIRE_LLVM" >> /app/etc/config/c.local.properties && \
    echo "tools.cire.name=CIRE" >> /app/etc/config/c.local.properties && \
    echo "tools.cire.type=postcompilation" >> /app/etc/config/c.local.properties && \
    echo "tools.cire.class=cire-tool" >> /app/etc/config/c.local.properties && \
    echo "tools.cire.options=--default-domain=[-10,10]" >> /app/etc/config/c.local.properties && \
    echo "" >> /app/etc/config/c.local.properties && \
    echo "# FPChecker tool" >> /app/etc/config/c.local.properties && \
    echo "tools.fpchecker.exe=/opt/fpchecker-llvm/bin/clang" >> /app/etc/config/c.local.properties && \
    echo "tools.fpchecker.name=FPChecker" >> /app/etc/config/c.local.properties && \
    echo "tools.fpchecker.type=independent" >> /app/etc/config/c.local.properties && \
    echo "tools.fpchecker.class=fpchecker-tool" >> /app/etc/config/c.local.properties && \
    echo "tools.fpchecker.options=-g -include /opt/fpchecker/src/Runtime_cpu.h -fpass-plugin=/opt/fpchecker/lib/libfpchecker_cpu.so" >> /app/etc/config/c.local.properties

# Expose Compiler Explorer port
EXPOSE 10240

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:10240/ || exit 1

# Set up working directory for user files
RUN mkdir -p /workspace

# Set working directory to /app where node_modules is located
WORKDIR /app

# Default command runs the explorer
CMD ["node", "--no-warnings=ExperimentalWarning", "--import=tsx", "app.ts"]

# ============================================================================
# Usage Examples:
# ============================================================================
# Build the image (from cire-explorer directory):
#   docker build -t cire-explorer:latest .
#
# Or use the build script:
#   ./docker-build.sh
#
# Run the explorer:
#   docker run -p 10240:10240 cire-explorer:latest
#   Then open http://localhost:10240 in your browser
#
# Run with custom port:
#   docker run -p 8080:10240 cire-explorer:latest
#   Then open http://localhost:8080 in your browser
#
# Interactive shell for debugging:
#   docker run --rm -it --entrypoint /bin/bash cire-explorer:latest
#
# Run with mounted workspace:
#   docker run -p 10240:10240 -v $(pwd)/examples:/workspace cire-explorer:latest
# ============================================================================
