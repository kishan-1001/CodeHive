import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { StaticAnalyzerService } from './staticAnalyzer';
import { executionLimiter } from '../utils/executionLimiter';

const execAsync = promisify(exec);

export interface ExecutionResult {
    output: string;
    error?: {
        type: 'SECURITY_VIOLATION' | 'TIME_LIMIT_EXCEEDED' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR' | 'SYSTEM_ERROR';
        message: string;
        line?: number | null;
        warnings?: string[];
    };
    runtime?: number;
}

export class CodeExecutionService {
    private static async isDockerRunning(): Promise<boolean> {
        try {
            await execAsync('docker ps');
            return true;
        } catch {
            return false;
        }
    }

    private static cleanStderr(stderr: string): string {
        if (!stderr) return '';
        return stderr.split('\n').filter(line =>
            !line.includes('Pulling fs layer') &&
            !line.includes('Already exists') &&
            !line.includes('Pull complete') &&
            !line.includes('Digest:') &&
            !line.includes('Status:') &&
            !line.includes('Unable to find image')
        ).join('\n').trim();
    }

    private static parseError(stderr: string, language: string, lineOffset: number): { message: string, line: number | null } {
        let line: number | null = null;
        let message = stderr;

        try {
            if (language === 'c' || language === 'cpp') {
                const match = stderr.match(/\/tmp\/code\.(?:c|cpp):(\d+):/);
                if (match) line = parseInt(match[1]);
            } else if (language === 'java') {
                const match = stderr.match(/\/tmp\/Main\.java:(\d+):/);
                if (match) line = parseInt(match[1]);
            } else if (language === 'python') {
                const match = stderr.match(/File "\/tmp\/code\.py", line (\d+)/);
                if (match) line = parseInt(match[1]);
            } else if (language === 'javascript') {
                const match = stderr.match(/\/tmp\/code\.js:(\d+)/);
                if (match) line = parseInt(match[1]);
            }

            if (line !== null) {
                line = Math.max(1, line - lineOffset);
            }
        } catch (e) { /* ignore */ }

        return { message, line };
    }

    public static async execute(
        code: string,
        language: string,
        input?: string,
        timeLimitMs: number = 10000,
        lineOffset: number = 0
    ): Promise<ExecutionResult> {
        // 1. Static Analysis Check
        const analysis = await StaticAnalyzerService.analyze(code, language);
        if (!analysis.isSafe) {
            return {
                output: '',
                error: {
                    type: 'SECURITY_VIOLATION',
                    message: 'Security Violation: Malicious code detected.',
                    warnings: analysis.warnings
                }
            };
        }

        // 2. Concurrency Limit
        if (!executionLimiter.tryAcquire()) {
            return {
                output: '',
                error: {
                    type: 'SYSTEM_ERROR',
                    message: 'Server is busy. Please try again later.'
                }
            };
        }

        try {
            // 3. Environment Check
            if (!(await this.isDockerRunning())) {
                return {
                    output: '',
                    error: { type: 'SYSTEM_ERROR', message: 'Execution environment (Docker) is not running.' }
                };
            }

            const startTime = Date.now();
            const timeLimitSec = Math.max(1, Math.ceil(timeLimitMs / 1000));
            const encodedCode = Buffer.from(code).toString('base64');
            const encodedInput = input ? Buffer.from(input).toString('base64') : null;

            let image = '';
            let setupCmd = '';
            let compileCmd = '';
            let runCmd = '';
            let sourceFile = '';

            switch (language.toLowerCase()) {
                case 'c':
                    image = 'gcc:latest';
                    sourceFile = '/tmp/code.c';
                    setupCmd = `echo "${encodedCode}" | base64 -d > ${sourceFile}`;
                    compileCmd = `gcc ${sourceFile} -o /tmp/code`;
                    runCmd = '/tmp/code';
                    break;
                case 'cpp':
                    image = 'gcc:latest';
                    sourceFile = '/tmp/code.cpp';
                    setupCmd = `echo "${encodedCode}" | base64 -d > ${sourceFile}`;
                    compileCmd = `g++ -O3 ${sourceFile} -o /tmp/code`;
                    runCmd = '/tmp/code';
                    break;
                case 'python':
                    image = 'python:3.9-alpine';
                    sourceFile = '/tmp/code.py';
                    setupCmd = `echo "${encodedCode}" | base64 -d > ${sourceFile}`;
                    runCmd = `python3 -u ${sourceFile}`;
                    break;
                case 'javascript':
                    image = 'node:18-alpine';
                    sourceFile = '/tmp/code.js';
                    setupCmd = `echo "${encodedCode}" | base64 -d > ${sourceFile}`;
                    runCmd = `node --input-type=module ${sourceFile}`;
                    break;
                case 'java':
                    image = 'amazoncorretto:11';
                    sourceFile = '/tmp/Main.java';
                    setupCmd = `echo "${encodedCode}" | base64 -d > ${sourceFile}`;
                    compileCmd = `javac ${sourceFile}`;
                    runCmd = 'java -cp /tmp Main';
                    break;
                default:
                    return { output: '', error: { type: 'SYSTEM_ERROR', message: 'Unsupported language' } };
            }

            const inputCmd = encodedInput ? `echo "${encodedInput}" | base64 -d | ` : '';
            const COMPILATION_ERROR_CODE = 123;

            // Unified shell command with security and timeout
            const shellCommand = [
                setupCmd,
                compileCmd ? `(${compileCmd} || exit ${COMPILATION_ERROR_CODE})` : '',
                `${inputCmd}timeout ${timeLimitSec}s ${runCmd}`
            ].filter(Boolean).join(' && ');

            // Resource limits hardened: 
            // - 256MB RAM
            // - 0.25 CPU
            // - 32 PIDs
            // - 1MB File Size limit
            // - No Network
            const dockerCommand = [
                'docker', 'run', '--rm',
                '--network', 'none',
                '--memory', '256m',
                '--memory-swap', '256m',
                '--cpus', '0.25',
                '--pids-limit', '32',
                '--ulimit', 'nproc=32:32',
                '--ulimit', 'fsize=1048576:1048576',
                '-i', image,
                'sh', '-c', `"${shellCommand}"`
            ];

            return await new Promise((resolve) => {
                const child = spawn(dockerCommand[0], dockerCommand.slice(1));
                let stdout = '';
                let stderr = '';

                child.stdout.on('data', (data) => stdout += data.toString());
                child.stderr.on('data', (data) => stderr += data.toString());

                const timeout = setTimeout(() => {
                    child.kill();
                    resolve({
                        output: stdout.trim(),
                        error: { type: 'TIME_LIMIT_EXCEEDED', message: 'Time Limit Exceeded' },
                        runtime: Date.now() - startTime
                    });
                }, timeLimitMs + 2000);

                child.on('close', (code) => {
                    clearTimeout(timeout);
                    const runtime = Date.now() - startTime;
                    const filteredStderr = this.cleanStderr(stderr);

                    if (code === 124 || code === null) {
                        resolve({ output: stdout.trim(), error: { type: 'TIME_LIMIT_EXCEEDED', message: 'Time Limit Exceeded' }, runtime });
                    } else if (code === COMPILATION_ERROR_CODE) {
                        const parsed = this.parseError(filteredStderr, language, lineOffset);
                        resolve({ output: stdout.trim(), error: { type: 'COMPILATION_ERROR', message: parsed.message, line: parsed.line }, runtime });
                    } else if (code !== 0) {
                        const parsed = this.parseError(filteredStderr, language, lineOffset);
                        resolve({ output: stdout.trim(), error: { type: 'RUNTIME_ERROR', message: parsed.message, line: parsed.line }, runtime });
                    } else {
                        resolve({ output: stdout.trim(), runtime });
                    }
                });
            });

        } catch (error: any) {
            return {
                output: '',
                error: { type: 'SYSTEM_ERROR', message: error.message || 'Unknown execution error' }
            };
        } finally {
            executionLimiter.release();
        }
    }

    public static async executeAndAnalyze(params: {
        code: string,
        language: string,
        testCases: any[],
        timeLimitMs: number,
        problemId: number,
        userId: number
    }): Promise<{ allPassed: boolean, avgRuntime: number, error?: { type: string, message: string } }> {
        let totalRuntime = 0;
        let allPassed = true;

        for (const testCase of params.testCases) {
            const result = await this.execute(params.code, params.language, testCase.input, params.timeLimitMs);

            if (result.error) {
                return { allPassed: false, avgRuntime: 0, error: result.error };
            }

            if (result.output?.trim() !== testCase.expected_output?.trim()) {
                allPassed = false;
                break;
            }
            totalRuntime += result.runtime || 0;
        }

        return {
            allPassed,
            avgRuntime: totalRuntime / (allPassed ? params.testCases.length : 1)
        };
    }
}
