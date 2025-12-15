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
import path from 'node:path';

import {ParsedAsmResultLine} from '../../types/asmresult/asmresult.interfaces.js';
import {CompilationInfo} from '../../types/compilation/compilation.interfaces.js';
import {UnprocessedExecResult} from '../../types/execution/execution.interfaces.js';
import {ResultLine} from '../../types/resultline/resultline.interfaces.js';
import {ToolResult} from '../../types/tool.interfaces.js';

import {BaseTool} from './base-tool.js';

export class CireTool extends BaseTool {
    private originalInputFilename?: string;
    private irOutputAsmLines?: ParsedAsmResultLine[];

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

        // Store the original input filename and LLVM IR data for source mapping
        this.originalInputFilename = compilationInfo.inputFilename;
        this.irOutputAsmLines = compilationInfo.irOutput.asm;

        // Write LLVM IR to a temporary file for CIRE to process
        const llvmIRFilename = compilationInfo.outputFilename + '.ll';
        await fs.writeFile(llvmIRFilename, llvmIRContent);
        
        return super.runTool(compilationInfo, llvmIRFilename, args);
    }

    private parseCireOutput(lines: string, inputFilename?: string): ResultLine[] {
        const result: ResultLine[] = [];
        const instructionToSourceMap = this.createInstructionToSourceMap();
        
        lines.split('\n').forEach(line => {
            const lineObj: ResultLine = {text: line};
            
            // Look for CIRE instruction lines like: "add7 (fadd): error contribution: 8.426e-01 (35.7%) |   %add7 = fadd double %0, %div6"
            const cireMatch = line.match(/^(\w+)\s*\([^)]+\):[^|]*\|\s*(.+)$/);
            if (cireMatch) {
                const llvmInstruction = cireMatch[2].trim();
                let sourceInfo = instructionToSourceMap.get(llvmInstruction);
                
                // If exact match fails, try partial matches
                if (!sourceInfo) {
                    // Try matching just the instruction part without debug info
                    const cleanInstr = llvmInstruction.replace(/,\s*!dbg.*$/, '').trim();
                    sourceInfo = instructionToSourceMap.get(cleanInstr);
                }
                
                if (!sourceInfo) {
                    // Try matching the variable name (e.g., "%add7")
                    const varMatch = llvmInstruction.match(/^\s*(%\w+)/);
                    if (varMatch) {
                        sourceInfo = instructionToSourceMap.get(varMatch[1]);
                    }
                }
                
                if (sourceInfo) {
                    // Add both tag (for clickability) and source (for mouseover highlighting)
                    lineObj.tag = {
                        line: sourceInfo.line,
                        column: sourceInfo.column || 1,
                        text: line,
                        severity: 1, // Info level for CIRE analysis results
                        file: inputFilename ? path.basename(inputFilename) : undefined,
                    };
                    
                    // Add source information for mouseover highlighting
                    lineObj.source = {
                        file: inputFilename ? path.basename(inputFilename) : null,
                        line: sourceInfo.line,
                        mainsource: true,
                    };
                }
            }
            
            result.push(lineObj);
        });
        
        return result;
    }

    private createInstructionToSourceMap(): Map<string, {line: number; column?: number}> {
        const instructionMap = new Map<string, {line: number; column?: number}>();
        
        if (!this.irOutputAsmLines) return instructionMap;
        
        // First, build a map of debug metadata to line numbers
        const debugMetadataMap = this.parseDebugMetadata();
        
        // Process each LLVM IR line to extract instruction-to-source mappings
        this.irOutputAsmLines.forEach(parsedLine => {
            const lineText = parsedLine.text.trim();
            
            // Look for instructions with debug info: %var = operation ..., !dbg !123
            const instrWithDebugMatch = lineText.match(/^\s*(%?\w+\s*=\s*[^,]+(?:,[^,!]*)*),\s*!dbg\s*!(\d+)/);
            if (instrWithDebugMatch) {
                const instruction = instrWithDebugMatch[1].trim();
                const debugRef = instrWithDebugMatch[2];
                const sourceLineNum = debugMetadataMap.get(debugRef);
                
                if (sourceLineNum) {
                    // Store multiple forms of the instruction for matching
                    instructionMap.set(instruction, {line: sourceLineNum});
                    
                    // Also store the full line without debug info
                    const fullInstruction = lineText.replace(/,\s*!dbg\s*!\d+/, '');
                    instructionMap.set(fullInstruction, {line: sourceLineNum});
                    
                    // Extract variable name if present (e.g., "%add7")
                    const varMatch = instruction.match(/^\s*(%\w+)/);
                    if (varMatch) {
                        instructionMap.set(varMatch[1], {line: sourceLineNum});
                    }
                }
            }
            
            // Fallback: use existing source mapping from parsed line if available
            if (parsedLine.source?.line && !instrWithDebugMatch) {
                instructionMap.set(lineText, {
                    line: parsedLine.source.line,
                    column: parsedLine.source.column
                });
            }
        });
        
        return instructionMap;
    }

    private parseDebugMetadata(): Map<string, number> {
        const debugMap = new Map<string, number>();
        
        if (!this.irOutputAsmLines) return debugMap;
        
        // Look for debug metadata definitions like: !21 = !DILocation(line: 5, ...)
        this.irOutputAsmLines.forEach(parsedLine => {
            const lineText = parsedLine.text.trim();
            const diLocationMatch = lineText.match(/^!(\d+)\s*=\s*!DILocation\(line:\s*(\d+)/);
            if (diLocationMatch) {
                const debugId = diLocationMatch[1];
                const lineNumber = parseInt(diLocationMatch[2], 10);
                debugMap.set(debugId, lineNumber);
            }
        });
        
        return debugMap;
    }

    protected override parseOutput(lines: string, inputFilename?: string, pathPrefix?: string): ResultLine[] {
        return this.parseCireOutput(lines, inputFilename);
    }

    override convertResult(result: UnprocessedExecResult, inputFilepath?: string, exeDir?: string): ToolResult {
        // Use the original source file for parsing, not the temporary LLVM IR file
        const sourceFilepath = this.originalInputFilename || inputFilepath;
        const transformedFilepath = sourceFilepath ? result.filenameTransform(sourceFilepath) : undefined;
        
        return {
            id: this.tool.id,
            name: this.tool.name,
            code: result.code,
            languageId: this.tool.languageId,
            stderr: this.parseOutput(result.stderr, transformedFilepath, exeDir),
            stdout: this.parseOutput(result.stdout, transformedFilepath, exeDir),
        };
    }
}