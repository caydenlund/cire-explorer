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

import path from 'node:path';
import fs from 'fs-extra';

import {CompilationInfo} from '../../types/compilation/compilation.interfaces.js';
import {UnprocessedExecResult} from '../../types/execution/execution.interfaces.js';
import {ResultLine} from '../../types/resultline/resultline.interfaces.js';
import {logger} from '../logger.js';

import {BaseTool} from './base-tool.js';

interface FPCheckerLogEntry {
    input: string;
    file: string;
    line: number;
    infinity_pos: number;
    infinity_neg: number;
    nan: number;
    division_zero: number;
    cancellation: number;
    comparison: number;
    underflow: number;
    latent_infinity_pos: number;
    latent_infinity_neg: number;
    latent_underflow: number;
}

export class FPCheckerTool extends BaseTool {
    private fpCheckerLogs: FPCheckerLogEntry[] = [];
    private tagsAdded = false;

    static get key() {
        return 'fpchecker-tool';
    }

    private async readFPCheckerLogs(workDir: string): Promise<FPCheckerLogEntry[]> {
        try {
            const logsDir = path.join(workDir, '.fpc_logs');

            // Check if logs directory exists
            if (!await fs.pathExists(logsDir)) {
                return [];
            }

            // Find all fpc_*.json files
            const files = await fs.readdir(logsDir);
            const jsonFiles = files.filter(f => f.startsWith('fpc_') && f.endsWith('.json'));

            if (jsonFiles.length === 0) {
                return [];
            }

            // Read the most recent log file
            const logFile = path.join(logsDir, jsonFiles[jsonFiles.length - 1]);
            const content = await fs.readFile(logFile, 'utf-8');
            const logs: FPCheckerLogEntry[] = JSON.parse(content);

            return logs;
        } catch (e) {
            logger.warn('Failed to read FPChecker logs:', e);
            return [];
        }
    }

    private formatFPCheckerErrors(entry: FPCheckerLogEntry): string[] {
        const errors: string[] = [];

        if (entry.division_zero > 0) errors.push(`Division by zero: ${entry.division_zero}`);
        if (entry.infinity_pos > 0) errors.push(`Positive infinity: ${entry.infinity_pos}`);
        if (entry.infinity_neg > 0) errors.push(`Negative infinity: ${entry.infinity_neg}`);
        if (entry.nan > 0) errors.push(`NaN: ${entry.nan}`);
        if (entry.cancellation > 0) errors.push(`Cancellation: ${entry.cancellation}`);
        if (entry.comparison > 0) errors.push(`Comparison: ${entry.comparison}`);
        if (entry.underflow > 0) errors.push(`Underflow: ${entry.underflow}`);
        if (entry.latent_infinity_pos > 0) errors.push(`Latent positive infinity: ${entry.latent_infinity_pos}`);
        if (entry.latent_infinity_neg > 0) errors.push(`Latent negative infinity: ${entry.latent_infinity_neg}`);
        if (entry.latent_underflow > 0) errors.push(`Latent underflow: ${entry.latent_underflow}`);

        return errors;
    }

    override async runTool(compilationInfo: CompilationInfo, inputFilepath?: string, args?: string[]) {
        if (!inputFilepath) {
            return this.createErrorResponse('<FPChecker requires a source file>');
        }

        // Reset state for new run
        this.fpCheckerLogs = [];
        this.tagsAdded = false;

        const execOptions = compilationInfo.execOptions || this.getDefaultExecOptions();
        if (compilationInfo.preparedLdPaths) execOptions.ldPath = compilationInfo.preparedLdPaths;

        const workDir = path.dirname(inputFilepath);
        execOptions.customCwd = workDir;

        // Set FPC_INSTRUMENT environment variable to enable instrumentation
        execOptions.env = {
            ...execOptions.env,
            FPC_INSTRUMENT: '1',
        };

        // Output binary path
        const outputBinary = path.join(workDir, 'fpchecker_output');

        try {
            // Step 1: Compile with FPChecker instrumentation
            const toolExe = this.getToolExe(compilationInfo);

            // Include the original compiler options from the compilation
            const compilerOptions = compilationInfo.options || [];

            const compileArgs = [
                inputFilepath,
                '-o',
                outputBinary,
                ...compilerOptions,  // Add the original compiler flags
                ...(this.tool.options || []),
                ...(args || []),
            ];

            logger.info(`FPChecker: Compiling with ${toolExe} ${compileArgs.join(' ')}`);

            // Debug output: Show what flags are being used
            let debugOutput = '\n=== FPChecker Compilation Flags ===\n';
            debugOutput += `Tool executable: ${toolExe}\n`;
            debugOutput += `Compiler options (from original compilation): ${JSON.stringify(compilerOptions)}\n`;
            debugOutput += `Tool options (from config): ${JSON.stringify(this.tool.options || [])}\n`;
            debugOutput += `Args parameter: ${JSON.stringify(args || [])}\n`;
            debugOutput += `Final compile command: ${toolExe} ${compileArgs.join(' ')}\n`;
            debugOutput += '====================================\n\n';

            const compileResult = await this.exec(toolExe, compileArgs, execOptions);

            // Prepend debug output to compilation stdout
            compileResult.stdout = debugOutput + (compileResult.stdout || '');

            if (compileResult.code !== 0) {
                // Compilation failed
                return this.convertResult(compileResult, inputFilepath);
            }

            // Step 2: Execute the instrumented binary
            logger.info(`FPChecker: Executing ${outputBinary}`);

            const execResult = await this.exec(outputBinary, [], execOptions);

            // Step 3: Read and parse FPChecker logs
            this.fpCheckerLogs = await this.readFPCheckerLogs(workDir);

            // Format logs as text output
            let logOutput = '\n=== FPChecker Floating-Point Error Analysis ===\n\n';
            if (this.fpCheckerLogs.length === 0) {
                logOutput += 'No floating-point errors detected.\n';
            } else {
                for (const entry of this.fpCheckerLogs) {
                    const errors = this.formatFPCheckerErrors(entry);
                    if (errors.length > 0) {
                        logOutput += `${entry.file}:${entry.line}\n`;
                        for (const error of errors) {
                            logOutput += `  - ${error}\n`;
                        }
                    }
                }
            }

            // Combine compilation, execution output, and parsed logs
            const combinedResult: UnprocessedExecResult = {
                ...execResult,
                stdout: compileResult.stdout + (compileResult.stdout && execResult.stdout ? '\n' : '') + execResult.stdout + logOutput,
                stderr: compileResult.stderr + (compileResult.stderr && execResult.stderr ? '\n' : '') + execResult.stderr,
            };

            return this.convertResult(combinedResult, inputFilepath);
        } catch (e) {
            logger.error('Error while running FPChecker: ', e);
            return this.createErrorResponse('Error while running FPChecker');
        }
    }

    protected override parseOutput(lines: string, inputFilename?: string): ResultLine[] {
        const result: ResultLine[] = [];

        // First, add output lines
        lines.split('\n').forEach(line => {
            const lineObj: ResultLine = {text: line};

            // Highlight FPChecker-specific output
            if (line.includes('#FPCHECKER:')) {
                lineObj.tag = {
                    line: 0,
                    column: 0,
                    text: line,
                    severity: 1, // Info level
                };
            }

            // Make file:line references clickable
            const fileLineMatch = line.match(/^(.+):(\d+)$/);
            if (fileLineMatch) {
                const [, file, lineNum] = fileLineMatch;
                lineObj.tag = {
                    line: parseInt(lineNum, 10),
                    column: 0,
                    text: line,
                    severity: 2, // Warning level
                    file: file,
                };
            }

            result.push(lineObj);
        });

        // Then, add tags for source code lines with errors (tooltips only, no text output)
        // Only add once to avoid duplicates from stderr/stdout both calling parseOutput
        if (!this.tagsAdded && this.fpCheckerLogs.length > 0) {
            this.tagsAdded = true;

            // Group by line number to avoid duplicates
            const errorsByLine = new Map<number, {file: string; errors: string[]}>();

            for (const entry of this.fpCheckerLogs) {
                const errors = this.formatFPCheckerErrors(entry);
                if (errors.length > 0) {
                    if (!errorsByLine.has(entry.line)) {
                        errorsByLine.set(entry.line, {file: entry.file, errors: []});
                    }
                    errorsByLine.get(entry.line)!.errors.push(...errors);
                }
            }

            // Create one tag per line
            for (const [lineNum, {file, errors}] of errorsByLine) {
                const errorMessage = `FPChecker: ${errors.join(', ')}`;
                result.push({
                    text: '', // Empty text so it doesn't show in output
                    tag: {
                        line: lineNum,
                        column: 0,
                        text: errorMessage,
                        severity: 2, // Warning level
                        file: file,
                    },
                });
            }
        }

        return result;
    }
}
