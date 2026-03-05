# CIRE Explorer Workspace

This directory can be mounted as a volume when running the CIRE Explorer Docker container, allowing you to easily share files between your host machine and the container.

## Usage

When running with docker-compose:
```bash
docker-compose up
```

The workspace is automatically mounted at `/workspace` in the container.

When running with docker directly:
```bash
docker run -p 10240:10240 -v $(pwd)/workspace:/workspace cire-explorer:latest
```

## What to Put Here

- **C/C++ source files** you want to analyze
- **LLVM IR files** (`.ll` files) for direct analysis
- **Domain specification files** (`.json`) for CIRE analysis
- **Example programs** to test CIRE functionality

## Examples

### Example 1: Simple Floating-Point Function

Create `cube.c`:
```c
double cube(double x) {
    return x * x * x;
}
```

Access it through the CIRE Explorer web interface at http://localhost:10240

### Example 2: Domain File for CIRE Analysis

Create `domain.json`:
```json
{
  "x": [-1000000, 1000000]
}
```

Use this with CIRE analysis in the web interface to specify input ranges.

### Example 3: Testing from Command Line

You can also test CIRE directly using the container:

```bash
# Write a test file
echo 'double square(double x) { return x * x; }' > workspace/test.c

# Compile and analyze using the container
docker exec -it cire-explorer bash -c "cd /workspace && \
  clang -S -emit-llvm -O0 test.c -o test.ll && \
  echo '{\"x\": [-100, 100]}' > domain.json && \
  CIRE_LLVM test.ll --domain domain.json --function square"
```

## File Permissions

When using Docker on Linux, files created in the container may have different ownership than your host user. You can fix this:

```bash
# Run container with your user ID
docker run -p 10240:10240 -v $(pwd)/workspace:/workspace --user $(id -u):$(id -g) cire-explorer:latest
```

Or fix ownership after:
```bash
sudo chown -R $USER:$USER workspace/
```

## Gitignore

The workspace directory is typically gitignored for temporary files and examples. Add persistent examples to a separate `examples/` directory in the repository if needed.
