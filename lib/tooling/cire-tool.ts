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
        // CIRE requires LLVM IR, not binary or regular assembly
        if (compilationInfo.filters.binary || compilationInfo.filters.binaryObject) {
            return this.createErrorResponse('<CIRE requires LLVM IR output - use -S -emit-llvm compilation flags>');
        }

        // Check if the user has enabled LLVM IR generation via compiler flags
        const hasEmitLLVM = compilationInfo.options.some(opt => opt.includes('-emit-llvm'));
        const hasAssemblyFlag = compilationInfo.options.some(opt => opt === '-S');
        
        if (!hasEmitLLVM || !hasAssemblyFlag) {
            return this.createErrorResponse('<CIRE requires LLVM IR generation. Please add "-S -emit-llvm" to compiler arguments>');
        }

        if (!compilationInfo.asm) {
            return this.createErrorResponse('<no LLVM IR output available - ensure -S -emit-llvm flags are set>');
        }

        const asmString = utils.normalizeAsmToString(compilationInfo.asm);
        
        // Validate that this is actually LLVM IR content
        if (!asmString.includes('target triple') && !asmString.includes('define ') && !asmString.includes('@')) {
            return this.createErrorResponse('<Output does not appear to be LLVM IR. Please use "-S -emit-llvm" compilation flags>');
        }

        const llvmIRFilename = compilationInfo.outputFilename + '.ll';
        await fs.writeFile(llvmIRFilename, asmString);
        
        return super.runTool(compilationInfo, llvmIRFilename, args);
    }
}