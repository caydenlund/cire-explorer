// Copyright (c) 2024, Compiler Explorer Authors
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright notice,
//       this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

import fs from 'node:fs/promises';

import {CompilationInfo} from '../../types/compilation/compilation.interfaces.js';
import * as utils from '../utils.js';

import {BaseTool} from './base-tool.js';

export class CireTool extends BaseTool {
    static get key() {
        return 'cire-tool';
    }

    override async runTool(compilationInfo: CompilationInfo, _inputFilepath?: string, args?: string[]) {
        // CIRE requires LLVM IR output from the dedicated LLVM IR pane
        if (!compilationInfo.irOutput || !compilationInfo.irOutput.asm) {
            return this.createErrorResponse('<CIRE requires LLVM IR output. Please add "LLVM IR" from the "Add new..." dropdown>');
        }

        // Extract LLVM IR content from the IR output
        const llvmIRLines = compilationInfo.irOutput.asm.map(line => line.text);
        const llvmIRContent = llvmIRLines.join('\n');
        
        // Basic validation that this is LLVM IR
        if (!llvmIRContent.includes('target triple') && !llvmIRContent.includes('define ') && !llvmIRContent.includes('@')) {
            return this.createErrorResponse('<IR output does not appear to be valid LLVM IR>');
        }

        // Write LLVM IR to a temporary file for CIRE to process
        const llvmIRFilename = compilationInfo.outputFilename + '.ll';
        await fs.writeFile(llvmIRFilename, llvmIRContent);
        
        return super.runTool(compilationInfo, llvmIRFilename, args);
    }
}