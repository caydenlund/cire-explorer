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
    private jsonResults?: any;
    private execDir?: string;

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

        // Store the execution directory for reading results.json later
        this.execDir = path.dirname(llvmIRFilename);

        // Run the tool (without --stdout to get human-readable output)
        // We need to call the base implementation but intercept to load JSON before parsing
        const execOptions = compilationInfo.execOptions || this.getDefaultExecOptions();
        if (compilationInfo.preparedLdPaths) execOptions.ldPath = compilationInfo.preparedLdPaths;
        execOptions.customCwd = this.execDir;

        let toolArgs = args || [];
        if (this.addOptionsToToolArgs) toolArgs = this.tool.options.concat(toolArgs);
        toolArgs.push(llvmIRFilename);

        const toolExe = this.getToolExe(compilationInfo);

        try {
            const execResult = await this.exec(toolExe, toolArgs, execOptions);

            // Try to read the JSON results file for source mapping BEFORE converting result
            try {
                const jsonPath = path.join(this.execDir, 'results.json');
                const jsonContent = await fs.readFile(jsonPath, 'utf-8');
                this.jsonResults = JSON.parse(jsonContent);
            } catch (e) {
                // JSON file not available, continue without it
                this.jsonResults = null;
            }

            return this.convertResult(execResult, llvmIRFilename);
        } catch (e) {
            return this.createErrorResponse('Error while running CIRE');
        }
    }

    private parseCireOutput(lines: string, inputFilename?: string): ResultLine[] {
        const result: ResultLine[] = [];
        const instructionToSourceMap = this.createInstructionToSourceMap();

        // Build a map from IR representation to source location from JSON
        const jsonSourceMap = new Map<string, {line: number; column?: number}>();
        if (this.jsonResults?.results?.per_instruction_errors) {
            for (const instr of this.jsonResults.results.per_instruction_errors) {
                if (instr.source_location) {
                    // Map the IR representation to source location
                    jsonSourceMap.set(instr.ir_representation, {
                        line: instr.source_location.line,
                        column: instr.source_location.column
                    });
                    // Also map the instruction name
                    jsonSourceMap.set(instr.instruction_name, {
                        line: instr.source_location.line,
                        column: instr.source_location.column
                    });
                }
            }
        }

        lines.split('\n').forEach(line => {
            const lineObj: ResultLine = {text: line};

            // Look for CIRE instruction lines in the text output
            // Format: "  %add = fadd double %x, %0                     3.5639e-13      20.04%"
            // Extract just the instruction part before the whitespace padding (2+ spaces)
            const instrMatch = line.match(/^\s*(%\w+\s*=\s*\S.*?)\s{2,}/);
            if (instrMatch) {
                const irRepr = instrMatch[1].trim();

                // Try to find source location from JSON first
                let sourceInfo = jsonSourceMap.get(irRepr);

                // Fallback to instruction name matching (check both JSON and IR maps)
                if (!sourceInfo) {
                    const nameMatch = irRepr.match(/^(%\w+)/);
                    if (nameMatch) {
                        const varName = nameMatch[1];
                        sourceInfo = jsonSourceMap.get(varName) || instructionToSourceMap.get(varName);
                    }
                }

                // Fallback to IR-based source mapping
                if (!sourceInfo) {
                    sourceInfo = instructionToSourceMap.get(irRepr);
                    if (!sourceInfo) {
                        // Try matching with leading spaces
                        sourceInfo = instructionToSourceMap.get('  ' + irRepr);
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
            if (parsedLine.source?.line) {
                instructionMap.set(lineText, {
                    line: parsedLine.source.line,
                    column: parsedLine.source.column
                });

                // Also extract and store the variable name for matching
                const varMatch = lineText.match(/^\s*(%\w+)\s*=/);
                if (varMatch) {
                    instructionMap.set(varMatch[1], {
                        line: parsedLine.source.line,
                        column: parsedLine.source.column
                    });
                }
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

    protected override parseOutput(lines: string, inputFilename?: string): ResultLine[] {
        return this.parseCireOutput(lines, inputFilename);
    }

    override convertResult(result: UnprocessedExecResult, inputFilepath?: string): ToolResult {
        // Use the original source file for parsing, not the temporary LLVM IR file
        const sourceFilepath = this.originalInputFilename || inputFilepath;
        const transformedFilepath = sourceFilepath ? result.filenameTransform(sourceFilepath) : undefined;

        return {
            id: this.tool.id,
            name: this.tool.name,
            code: result.code,
            languageId: this.tool.languageId,
            stderr: this.parseOutput(result.stderr, transformedFilepath),
            stdout: this.parseOutput(result.stdout, transformedFilepath),
        };
    }
}