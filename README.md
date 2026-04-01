# CIRE Explorer

CIRE Explorer is a specialized version of Compiler Explorer that integrates two floating-point analysis tools:
- **CIRE**: Provides rigid error bounds introduced by floating-point roundoff in computations
- **FPChecker**: Detects numerical instabilities like catastrophic cancellation and latent infinity

## Quick Start with Docker

The easiest way to get started is using the pre-built Docker container:

```bash
docker run -p 10240:10240 caydenlund/cire-explorer
```

Then open [http://localhost:10240](http://localhost:10240) in your browser.

## Demo: Analyzing Roundoff Error with CIRE and FPChecker

Let's analyze a simple floating-point computation to understand how roundoff errors propagate through the calculation.

### Step 1: Write Your Function

Enter this simple program in the editor:

```c
float compute(float x, float y) {
    return x - y * 0.5F;
}

#include <stdio.h>
int main() {
    float a = 1e10F + 1e-3F;
    float b = 2e10F;
    printf("%f\n", compute(a, b));
}
```

This function performs a single basic block computation: multiply `y` by 0.5, then subtract from `x`.

### Step 2: Configure the Compiler

1. **Select Language**: Choose **C** from the language dropdown (top-left)
2. **Select Compiler**: Choose **clang default** from the compiler dropdown.
    In "Compiler options", add some optimization level for CIRE: `-O1`, `-O2`, or `-O3`.
    For FPChecker, also disable FMA operations and inlining with `-ffp-contract=off -fno-inline`.

### Step 3a: Open the CIRE Tool

1. Click the **"Add new..." (plus symbol)** button in the compiler output pane
2. Select **"LLVM IR"** from the dropdown
    You'll see the LLVM intermediate representation of your function.
3. In the compiler pane again, click the **"Add tool..." (screwdriver symbol)** button
4. Select **"CIRE"** from the dropdown
    The CIRE analysis pane will appear

### Step 3b: Open the FPChecker Tool

1. Click the **"Add tool..."** button in the compiler output pane
2. Select **"FPChecker"** from the dropdown
3. The FPChecker analysis pane will appear

### Understanding the Results

The CIRE output will show you the maximum roundoff error that can accumulate in your computation for inputs in the range, expressed as error bounds on the final result, along with
- **Absolute and relative error bounds** for the computation for inputs in the range \[-1e6, 1e6\]
- **Per-instruction sensitivity analysis (error contribution)** showing how input errors propagate through the computation

FPChecker's analysis helps you understand:
- **Where** numerical instabilities occur in your code
- **Why** they happen (cancellation, absorption, etc.)

## Building from Source

If you prefer to build and run locally without Docker:

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

2. **Bootstrap CIRE:**
   ```bash
   ./etc/scripts/bootstrap-cire.sh
   ```

3. **Build and run:**
   ```bash
   npm start
   ```

4. **Access the interface:**
   Open [http://localhost:10240](http://localhost:10240) in your browser.

See the original README sections for manual setup and troubleshooting.

## Building Your Own Docker Image

If you want to build the Docker image yourself:

```bash
# Using docker-compose (recommended)
docker-compose up

# Or build manually from parent directory containing CIRE/, cire-explorer/, and llvm-upstream/
cd /path/to/parent
docker build -t cire-explorer:latest -f cire-explorer/Dockerfile .
docker run -p 10240:10240 cire-explorer:latest
```

The Docker image includes:
- **Compiler Explorer Web UI** - Interactive compiler explorer interface
- **CIRE** - Complete error analysis toolchain
- **FPChecker** - Numerical instability detector
- **LLVM 19.1.7** - Full clang/LLVM toolchain
- All dependencies pre-configured

See [DOCKER.md](DOCKER.md) for complete Docker documentation.

## Learn More

- **CIRE**: [https://github.com/caydenlund/CIRE](https://github.com/caydenlund/CIRE)
- **Compiler Explorer**: [https://github.com/compiler-explorer/compiler-explorer](https://github.com/compiler-explorer/compiler-explorer)

## Troubleshooting

**FPChecker shows no results**: Ensure your `main()` function actually executes code that could have numerical issues. FPChecker analyzes the execution, not just the code structure.
