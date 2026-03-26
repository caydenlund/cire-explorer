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

## Demo 1: Analyzing Roundoff Error with CIRE

Let's analyze a simple floating-point computation to understand how roundoff errors propagate through the calculation.

### Step 1: Write Your Function

Enter this simple function in the editor:

```c
double compute(double x, double y) {
    return x - y * 0.5;
}
```

This function performs a single basic block computation: multiply `y` by 0.5, then subtract from `x`.

### Step 2: Configure the Compiler

1. **Select Language**: Choose **C** from the language dropdown (top-left)
2. **Select Compiler**: Choose **clang default** from the compiler dropdown. In "Compiler options", add some optimization level: `-O1`, `-O2`, or `-O3`

### Step 3: Open the LLVM IR Pane

1. Click the **"Add new..."** button in the compiler output pane
2. Select **"LLVM IR"** from the dropdown

You'll see the LLVM intermediate representation of your function.

### Step 4: Open the CIRE Tool

1. In the LLVM IR pane, click the **"Add tool..."** button
2. Select **"CIRE"** from the dropdown
3. The CIRE analysis pane will appear, showing:
   - **Absolute and relative error bounds** for the computation for inputs in the range \[-1e6, 1e6\]
   - **Per-instruction sensitivity analysis (error contribution)** showing how input errors propagate through the computation

The CIRE output will show you the maximum roundoff error that can accumulate in your computation for inputs in the range, expressed as error bounds on the final result.

## Demo 2: Detecting Catastrophic Cancellation with FPChecker

Now let's see how FPChecker detects numerical instabilities when we call our function with problematic inputs.

### Step 1: Add compiler flags

- `-ffp-contract=off` - FPChecker struggles with FMA operations
- `-fno-inline` - If the computation isn't actually being done, then the instrumentation can't be performed

### Step 2: Add a Main Function

Modify your code to include a `main()` function that triggers catastrophic cancellation:

```c
double compute(double x, double y) {
    return x - y * 0.5;
}

#include <stdio.h>

int main() {
    double a = 1e10 + 1;
    double b = 2e10;
    printf("%f\n", compute(a, b));
    return 0;
}
```

In this example, we're subtracting two very close numbers (`10000000001` and `10000000000`), which causes catastrophic cancellation where significant digits are lost due to subtraction of nearly-equal values.

### Step 3: Open the FPChecker Tool

1. Click the **"Add tool..."** button in the compiler output pane
2. Select **"FPChecker"** from the dropdown
3. The FPChecker analysis pane will appear

### Understanding the Results

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
