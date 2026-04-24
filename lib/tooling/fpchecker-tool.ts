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

interface FPCheckerRoundingEntry {
    file: string;
    line: number;
    error: number;
    relative_error: number;
}

export class FPCheckerTool extends BaseTool {
    private fpCheckerLogs: FPCheckerLogEntry[] = [];
    private fpCheckerRoundingLogs: FPCheckerRoundingEntry[] = [];
    private tagsAdded = false;

    static get key() {
        return 'fpchecker-tool';
    }

    private async readFPCheckerErrorLogs(workDir: string): Promise<FPCheckerLogEntry[]> {
        try {
            const logsDir = path.join(workDir, '.fpc_logs');

            // Check if logs directory exists
            if (!await fs.pathExists(logsDir)) {
                logger.info(`FPChecker: Logs directory does not exist: ${logsDir}`);
                return [];
            }

            // Find all fpc_*.json files
            const files = await fs.readdir(logsDir);
            logger.info(`FPChecker: Files in logs directory: ${JSON.stringify(files)}`);
            const jsonFiles = files.filter(f => f.startsWith('fpc_') && f.endsWith('.json'));

            if (jsonFiles.length === 0) {
                logger.info('FPChecker: No fpc_*.json files found in logs directory');
                return [];
            }

            // Read the most recent log file
            const logFile = path.join(logsDir, jsonFiles[jsonFiles.length - 1]);
            logger.info(`FPChecker: Reading log file: ${logFile}`);
            const content = await fs.readFile(logFile, 'utf-8');
            logger.info(`FPChecker: Log file content length: ${content.length} bytes`);
            logger.info(`FPChecker: Log file raw content: ${content}`);
            const logs: FPCheckerLogEntry[] = JSON.parse(content);

            return logs;
        } catch (e) {
            logger.warn('Failed to read FPChecker error logs:', e);
            return [];
        }
    }

    private async readFPCheckerRoundingLogs(workDir: string): Promise<FPCheckerRoundingEntry[]> {
        try {
            const logsDir = path.join(workDir, '.fpc_logs');

            // Check if logs directory exists
            if (!await fs.pathExists(logsDir)) {
                logger.info(`FPChecker: Logs directory does not exist (rounding): ${logsDir}`);
                return [];
            }

            // Find all fpc_*.json files
            const files = await fs.readdir(logsDir);
            logger.info(`FPChecker: Files in logs directory (rounding): ${JSON.stringify(files)}`);
            const jsonFiles = files.filter(f => f.startsWith('rounding_error_') && f.endsWith('.json'));

            if (jsonFiles.length === 0) {
                logger.info('FPChecker: No fpc_*.json files found in logs directory (rounding)');
                return [];
            }

            // Read the most recent log file
            const logFile = path.join(logsDir, jsonFiles[jsonFiles.length - 1]);
            logger.info(`FPChecker: Reading rounding log file: ${logFile}`);
            const content = await fs.readFile(logFile, 'utf-8');
            logger.info(`FPChecker: Rounding log file content length: ${content.length} bytes`);
            logger.info(`FPChecker: Rounding log file raw content: ${content}`);
            const logs: FPCheckerRoundingEntry[] = JSON.parse(content);

            return logs;
        } catch (e) {
            logger.warn('Failed to read FPChecker rounding logs:', e);
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

    private formatRoundingErrors(entry: FPCheckerRoundingEntry): string[] {
        const errors: string[] = [];

        logger.info(`FPChecker: formatRoundingErrors called with entry: ${JSON.stringify(entry)}`);
        logger.info(`FPChecker: entry.error = ${entry.error}, entry.relative_error = ${entry.relative_error}`);

        // Format absolute error
        if (entry.error != null) {
            errors.push(`Absolute error: ${entry.error.toExponential(6)}`);
        }

        // Format relative error
        if (entry.relative_error != null) {
            errors.push(`Relative error: ${entry.relative_error.toExponential(6)}`);
        }

        logger.info(`FPChecker: formatRoundingErrors returning ${errors.length} errors: ${JSON.stringify(errors)}`);

        return errors;
    }

    override async runTool(compilationInfo: CompilationInfo, inputFilepath?: string, args?: string[]) {
        if (!inputFilepath) {
            return this.createErrorResponse('<FPChecker requires a source file>');
        }

        // Reset state for new run
        this.fpCheckerLogs = [];
        this.fpCheckerRoundingLogs = [];
        this.tagsAdded = false;

        const execOptions = compilationInfo.execOptions || this.getDefaultExecOptions();
        if (compilationInfo.preparedLdPaths) execOptions.ldPath = compilationInfo.preparedLdPaths;

        const workDir = path.dirname(inputFilepath);
        execOptions.customCwd = workDir;

        logger.info(`FPChecker: Initial execOptions: ${JSON.stringify(execOptions)}`);

        // Output binary paths
        const outputBinaryError = path.join(workDir, 'fpchecker_output_fperr');
        const outputBinaryRound = path.join(workDir, 'fpchecker_output_round');

        try {
            const toolExe = this.getToolExe(compilationInfo);
            const compilerOptions = compilationInfo.options || [];

            const compileArgs = [
                inputFilepath,
                ...compilerOptions,  // Add the original compiler flags
                ...(this.tool.options || []),
                ...(args || []),
            ];

            // Debug output: Show what flags are being used
            let debugOutput = '\n=== FPChecker Compilation Flags ===\n';
            debugOutput += `Tool executable: ${toolExe}\n`;
            debugOutput += `Compiler options (from original compilation): ${JSON.stringify(compilerOptions)}\n`;
            debugOutput += `Tool options (from config): ${JSON.stringify(this.tool.options || [])}\n`;
            debugOutput += `Args parameter: ${JSON.stringify(args || [])}\n`;
            debugOutput += '====================================\n\n';

            // ===== MODE 1: Floating-Point Error Detection (FPC_INSTRUMENT) =====

            // Set FPC_INSTRUMENT environment variable during compilation
            const compileOptionsError = {
                ...execOptions,
                env: {
                    ...execOptions.env,
                    FPC_INSTRUMENT: '1',
                },
            };

            const compileArgsError = [...compileArgs];

            logger.info(`FPChecker: Compiling with FPC_INSTRUMENT: ${toolExe} ${compileArgsError.join(' ')}`);
            logger.info(`FPChecker: Compile environment: ${JSON.stringify(compileOptionsError.env)}`);

            const compileResultError = await this.exec(toolExe, compileArgsError, compileOptionsError);

            if (compileResultError.code !== 0) {
                // Compilation failed for error detection mode
                compileResultError.stdout = debugOutput + (compileResultError.stdout || '');
                return this.convertResult(compileResultError, inputFilepath);
            }

            // Move a.out to the desired output location (wrapper doesn't support -o)
            const aoutPath = path.join(workDir, 'a.out');
            try {
                await fs.move(aoutPath, outputBinaryError, {overwrite: true});
            } catch (e) {
                logger.error('Failed to move a.out to output binary:', e);
                return this.createErrorResponse('Failed to move compiled binary');
            }

            // Execute the instrumented binary for error detection (no special env vars needed at runtime)
            logger.info(`FPChecker: Executing ${outputBinaryError} (error detection mode)`);
            logger.info(`FPChecker: Working directory: ${workDir}`);

            const execResultError = await this.exec(outputBinaryError, [], execOptions);
            logger.info(`FPChecker: Error detection execution result - code: ${execResultError.code}, stdout length: ${(execResultError.stdout || '').length}, stderr length: ${(execResultError.stderr || '').length}`);
            if (execResultError.stdout) logger.info(`FPChecker: Error detection stdout: ${execResultError.stdout}`);
            if (execResultError.stderr) logger.info(`FPChecker: Error detection stderr: ${execResultError.stderr}`);

            // Read error detection logs
            this.fpCheckerLogs = await this.readFPCheckerErrorLogs(workDir);
            logger.info(`FPChecker: Read ${this.fpCheckerLogs.length} error detection entries`);

            // Clear logs directory before second run to avoid confusion
            const logsDir = path.join(workDir, '.fpc_logs');
            try {
                await fs.remove(logsDir);
            } catch (e) {
                logger.warn('Failed to clear FPChecker logs directory:', e);
            }

            // ===== MODE 2: Shadow Evaluation (FPC_INSTRUMENT_ERR_TRACKING) =====

            // Set FPC_INSTRUMENT_ERR_TRACKING environment variable during compilation
            const compileOptionsRound = {
                ...execOptions,
                env: {
                    ...execOptions.env,
                    FPC_INSTRUMENT_ERR_TRACKING: '1',
                },
            };

            const compileArgsRound = [...compileArgs];

            logger.info(`FPChecker: Compiling with FPC_INSTRUMENT_ERR_TRACKING: ${toolExe} ${compileArgsRound.join(' ')}`);
            logger.info(`FPChecker: Rounding compile environment: ${JSON.stringify(compileOptionsRound.env)}`);

            const compileResultRound = await this.exec(toolExe, compileArgsRound, compileOptionsRound);

            if (compileResultRound.code !== 0) {
                // Compilation failed for shadow evaluation mode
                // Still show error detection results if available
                compileResultRound.stdout = debugOutput + (compileResultRound.stdout || '');
                logger.warn('FPChecker: Shadow evaluation compilation failed, showing error detection results only');
            } else {
                // Move a.out to the desired output location (wrapper doesn't support -o)
                try {
                    logger.info(`FPChecker: Moving 'a.out' to '${outputBinaryRound}'...`);
                    await fs.move(aoutPath, outputBinaryRound, {overwrite: true});
                    logger.info('FPChecker: OK');
                } catch (e) {
                    logger.error('Failed to move a.out to output binary:', e);
                    return this.createErrorResponse('Failed to move compiled binary');
                }

                // Execute the instrumented binary for shadow evaluation (no special env vars needed at runtime)
                logger.info(`FPChecker: Executing ${outputBinaryRound} (shadow evaluation mode)`);
                logger.info(`FPChecker: Working directory: ${workDir}`);

                const execResultRound = await this.exec(outputBinaryRound, [], execOptions);
                logger.info(`FPChecker: Rounding execution result - code: ${execResultRound.code}, stdout length: ${(execResultRound.stdout || '').length}, stderr length: ${(execResultRound.stderr || '').length}`);
                if (execResultRound.stdout) logger.info(`FPChecker: Rounding stdout: ${execResultRound.stdout}`);
                if (execResultRound.stderr) logger.info(`FPChecker: Rounding stderr: ${execResultRound.stderr}`);

                // Read shadow evaluation logs
                this.fpCheckerRoundingLogs = await this.readFPCheckerRoundingLogs(workDir);
                logger.info(`FPChecker: Read ${this.fpCheckerRoundingLogs.length} rounding error entries`);
                logger.info(`FPChecker: Rounding entries content: ${JSON.stringify(this.fpCheckerRoundingLogs)}`);
            }

            // ===== Combine Results =====

            // Format error detection logs
            let logOutput = '\n=== FPChecker Floating-Point Error Detection ===\n\n';
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

            // Format shadow evaluation logs
            logOutput += '\n=== FPChecker Shadow Evaluation (Rounding Errors) ===\n\n';
            logger.info(`FPChecker: Formatting rounding logs, count = ${this.fpCheckerRoundingLogs.length}`);
            if (this.fpCheckerRoundingLogs.length === 0) {
                logOutput += 'No rounding errors tracked.\n';
            } else {
                for (const entry of this.fpCheckerRoundingLogs) {
                    logger.info(`FPChecker: Processing rounding entry: ${JSON.stringify(entry)}`);
                    const errors = this.formatRoundingErrors(entry);
                    logger.info(`FPChecker: Got ${errors.length} formatted errors`);
                    if (errors.length > 0) {
                        logOutput += `${entry.file}:${entry.line}\n`;
                        for (const error of errors) {
                            logOutput += `  - ${error}\n`;
                        }
                    } else {
                        logger.warn(`FPChecker: No formatted errors for entry at ${entry.file}:${entry.line}`);
                    }
                }
            }
            logger.info(`FPChecker: Final logOutput length: ${logOutput.length}`);

            // Combine compilation, execution output, and parsed logs
            const combinedResult: UnprocessedExecResult = {
                ...execResultError,
                stdout: debugOutput +
                        (compileResultError.stdout || '') +
                        (execResultError.stdout ? '\n' + execResultError.stdout : '') +
                        logOutput,
                stderr: (compileResultError.stderr || '') +
                        (execResultError.stderr ? '\n' + execResultError.stderr : ''),
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
        if (!this.tagsAdded && (this.fpCheckerLogs.length > 0 || this.fpCheckerRoundingLogs.length > 0)) {
            this.tagsAdded = true;

            // Group by line number to avoid duplicates
            const errorsByLine = new Map<number, {file: string; errors: string[]; roundingErrors: string[]}>();

            // Add error detection tags
            for (const entry of this.fpCheckerLogs) {
                const errors = this.formatFPCheckerErrors(entry);
                if (errors.length > 0) {
                    if (!errorsByLine.has(entry.line)) {
                        errorsByLine.set(entry.line, {file: entry.file, errors: [], roundingErrors: []});
                    }
                    errorsByLine.get(entry.line)!.errors.push(...errors);
                }
            }

            // Add rounding error tags
            for (const entry of this.fpCheckerRoundingLogs) {
                const errors = this.formatRoundingErrors(entry);
                if (errors.length > 0) {
                    if (!errorsByLine.has(entry.line)) {
                        errorsByLine.set(entry.line, {file: entry.file, errors: [], roundingErrors: []});
                    }
                    errorsByLine.get(entry.line)!.roundingErrors.push(...errors);
                }
            }

            // Create one tag per line combining both error types
            for (const [lineNum, {file, errors, roundingErrors}] of errorsByLine) {
                const allErrors: string[] = [];

                if (errors.length > 0) {
                    allErrors.push(`Error Detection: ${errors.join(', ')}`);
                }

                if (roundingErrors.length > 0) {
                    allErrors.push(`Rounding: ${roundingErrors.join(', ')}`);
                }

                if (allErrors.length > 0) {
                    const errorMessage = `FPChecker - ${allErrors.join(' | ')}`;
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
        }

        return result;
    }
}
