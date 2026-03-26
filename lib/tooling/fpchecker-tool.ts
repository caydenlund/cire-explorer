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

import {CompilationInfo} from '../../types/compilation/compilation.interfaces.js';
import {UnprocessedExecResult} from '../../types/execution/execution.interfaces.js';
import {ResultLine} from '../../types/resultline/resultline.interfaces.js';
import {logger} from '../logger.js';

import {BaseTool} from './base-tool.js';

export class FPCheckerTool extends BaseTool {
    static get key() {
        return 'fpchecker-tool';
    }

    override async runTool(compilationInfo: CompilationInfo, inputFilepath?: string, args?: string[]) {
        if (!inputFilepath) {
            return this.createErrorResponse('<FPChecker requires a source file>');
        }

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
            const compileArgs = [
                inputFilepath,
                '-o',
                outputBinary,
                ...(this.tool.options || []),
                ...(args || []),
            ];

            logger.info(`FPChecker: Compiling with ${toolExe} ${compileArgs.join(' ')}`);

            const compileResult = await this.exec(toolExe, compileArgs, execOptions);

            if (compileResult.code !== 0) {
                // Compilation failed
                return this.convertResult(compileResult, inputFilepath);
            }

            // Step 2: Execute the instrumented binary
            logger.info(`FPChecker: Executing ${outputBinary}`);

            const execResult = await this.exec(outputBinary, [], execOptions);

            // Combine compilation and execution output
            const combinedResult: UnprocessedExecResult = {
                ...execResult,
                stdout: compileResult.stdout + (compileResult.stdout && execResult.stdout ? '\n' : '') + execResult.stdout,
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

        lines.split('\n').forEach(line => {
            const lineObj: ResultLine = {text: line};

            // Highlight FPChecker-specific output
            if (line.includes('#FPCHECKER:')) {
                // Mark FPChecker messages as informational
                lineObj.tag = {
                    line: 0,
                    column: 0,
                    text: line,
                    severity: 1, // Info level
                };
            }

            result.push(lineObj);
        });

        return result;
    }
}
