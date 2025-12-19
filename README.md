# CIRE Explorer

CIRE Explorer is a specialized version of Compiler Explorer configured to work with CIRE, a tool for providing rigid error bounds introduced by floating-point roundoff in computations.

## Quick Start

### Prerequisites

- Node.js 20 or higher
- CIRE binary built and available
- Clang/LLVM compiler

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/caydenlund/cire-explorer
   cd cire-explorer
   npm install
   ```

2. **Configure CIRE location:**
   Create `etc/config/c.local.properties` with your CIRE configuration:
   ```properties
   # Point to your clang compiler
   compiler.cclangdefault.exe=/path/to/your/clang

   # Configure CIRE tool
   tools=cire
   tools.cire.name=CIRE
   tools.cire.exe=/path/to/your/CIRE/build/bin/CIRE_LLVM
   tools.cire.type=postcompilation
   tools.cire.class=cire-tool
   tools.cire.options=--stdout
   ```

   Replace `/path/to/your/clang` with your clang installation path and `/path/to/your/CIRE/build/bin/CIRE_LLVM` with your CIRE binary path.

3. **Build and run:**
   ```bash
   npm start
   ```

4. **Access the interface:**
   Open [http://localhost:10240](http://localhost:10240) in your browser.

### Troubleshooting

**CIRE not appearing**: Check that `tools.cire.exe` points to a valid executable and the path is absolute.

**Compilation errors**: Verify your clang path in `compiler.cclangdefault.exe` is correct.

**Build issues**: Ensure Node.js 20+ is installed and run `npm install` to update dependencies.
