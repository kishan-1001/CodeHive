import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { pool } from '../config/db';
import { executionLimiter } from '../utils/executionLimiter';

const router = Router();
const execAsync = promisify(exec);

interface ExecuteRequest {
  code: string;
  language: string;
  input?: string;
  problem_id?: number;
}

async function isDockerRunning(): Promise<boolean> {
  try {
    await execAsync('docker ps');
    return true;
  } catch {
    return false;
  }
}

router.post('/', async (req, res) => {
  const { code, language, input, problem_id }: ExecuteRequest = req.body;

  console.log('Execute request received:', { code: code.substring(0, 50) + '...', language, input, problem_id });

  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  try {
    // Fetch wrapper code if problem_id is provided
    let wrapperCode = '';
    if (problem_id) {
      try {
        const templateResult = await pool.query(`
          SELECT wrapper_code
          FROM problem_templates
          WHERE problem_id = $1 AND language = $2
        `, [problem_id, language]);

        if (templateResult.rows.length > 0) {
          wrapperCode = templateResult.rows[0].wrapper_code;
        }
      } catch (dbError) {
        console.warn('Could not fetch wrapper code:', dbError);
      }
    }

    // Calculate line offset
    let lineOffset = 0;
    let fullCode = code;
    if (wrapperCode) {
      const placeholder = language === 'python' ? '# <<< INSERT USER CODE HERE >>>' : '// <<< INSERT USER CODE HERE >>>';
      const placeholderIndex = wrapperCode.indexOf(placeholder);

      if (placeholderIndex !== -1) {
        // Count lines before placeholder to determine offset
        const prefix = wrapperCode.substring(0, placeholderIndex);
        lineOffset = prefix.split('\n').length - 1;
        fullCode = wrapperCode.replace(placeholder, code);
      } else {
        // Fallback if placeholder not exact match (though query should guarantee it if set up right)
        fullCode = code; // Or append/prepend? Safer to use raw code if wrapper logic fails.
      }
    }

    const encodedCode = Buffer.from(fullCode).toString('base64');

    // Process input
    let processedInput = input;
    if ((language === 'cpp' || language === 'c' || language === 'java' || language === 'python' || language === 'javascript') && input) {
      if (input.startsWith('nums = [')) {
        const match = input.match(/nums = \[([^\]]+)\], target = (\d+)/);
        if (match) {
          const numsStr = match[1];
          const target = match[2];
          const nums = numsStr.split(',').map(s => s.trim());
          processedInput = nums.join(' ') + '\n' + target;
        }
      }
    }
    const encodedInput = processedInput ? Buffer.from(processedInput).toString('base64') : null;

    // Check Concurrency Limit
    if (!executionLimiter.tryAcquire()) {
      return res.status(429).json({
        error: {
          type: 'SERVER_BUSY',
          message: 'Server is currently busy (max 3 concurrent executions). Please wait a moment and try again.'
        }
      });
    }

    try {
      // Check Docker
      if (!(await isDockerRunning())) {
        throw new Error('Docker is not running. Please start Docker Desktop.');
      }

      const COMPILATION_ERROR_CODE = 123;

      if (['c', 'cpp', 'java'].includes(language)) {
        // Compiled languages: Compile then Run in SAME container
        let compileCmd = '';
        let runCmd = '';
        let image = '';
        let sourceFile = '';

        if (language === 'c') {
          image = 'gcc:latest';
          sourceFile = '/tmp/code.c';
          // Setup source -> Compile (exit 123 if fail) -> Run
          compileCmd = `gcc ${sourceFile} -o /tmp/code`;
          runCmd = '/tmp/code';
        } else if (language === 'cpp') {
          image = 'gcc:latest';
          sourceFile = '/tmp/code.cpp';
          compileCmd = `g++ ${sourceFile} -o /tmp/code`;
          runCmd = '/tmp/code';
        } else if (language === 'java') {
          image = 'amazoncorretto:11';
          sourceFile = '/tmp/Main.java';
          compileCmd = `javac ${sourceFile}`;
          runCmd = 'java -cp /tmp Main';
        }

        // Construct command: setup source && (compile || exit 123) && run
        // input handling: echo input | run
        let finalRunCmd = runCmd;
        if (encodedInput) {
          finalRunCmd = `echo "${encodedInput}" | base64 -d | ${runCmd}`;
        }

        const shellCommand = `echo "${encodedCode}" | base64 -d > ${sourceFile} && (${compileCmd} || exit ${COMPILATION_ERROR_CODE}) && ${finalRunCmd}`;
        const dockerCommand = `docker run --rm --network none -i ${image} sh -c "${shellCommand}"`;

        try {
          const { stdout, stderr } = await execAsync(dockerCommand, { timeout: 10000 }); // 10s runtime limit

          // Success (Exit code 0)
          res.json({ output: stdout });

        } catch (error: any) {
          // Failed (Exit code != 0)
          if (error.killed) {
            return res.json({
              output: '',
              error: { type: 'TIME_LIMIT_EXCEEDED', message: 'Time Limit Exceeded', line: null }
            });
          }

          const stderr = error.stderr || error.message || '';
          const parsed = parseError(stderr, language, lineOffset, code);
          const isCompilationError = error.code === COMPILATION_ERROR_CODE;

          res.json({
            output: error.stdout || '', // Partial stdout might exist
            error: {
              type: isCompilationError ? 'COMPILATION_ERROR' : 'RUNTIME_ERROR',
              message: parsed.message,
              line: parsed.line
            }
          });
        }

      } else {
        // Interpreted languages (Python, JS)
        let image = '';
        let command = '';

        if (language === 'python') {
          image = 'python:3.9-alpine';
          command = `echo "${encodedCode}" | base64 -d > /tmp/code.py`;
          if (encodedInput) {
            command += ` && echo "${encodedInput}" | base64 -d | python3 -u /tmp/code.py`;
          } else {
            command += ` && python3 -u /tmp/code.py`;
          }
        } else if (language === 'javascript') {
          image = 'node:18-alpine';
          command = `echo "${encodedCode}" | base64 -d > /tmp/code.js`;
          if (encodedInput) {
            command += ` && echo "${encodedInput}" | base64 -d | node --input-type=module /tmp/code.js`;
          } else {
            command += ` && node --input-type=module /tmp/code.js`;
          }
        }

        const dockerCommand = `docker run --rm --network none -i ${image} sh -c "${command}"`;

        try {
          const { stdout, stderr } = await execAsync(dockerCommand, { timeout: 10000 });

          // Clean stderr for some specific unwanted messages (e.g. node experimental warnings)
          let filteredStderr = cleanStderr(stderr);

          if (filteredStderr) {
            // Even with exit code 0, stderr might have warnings/errors
            // But typically if it didn't throw, it's fine, unless it's a specific language behavior.
            // Python prints to stderr on error and exits non-zero, so we usually catch it in catch block globally?
            // Wait, execAsync throws if exit code != 0.
            // So if we are here, exit code is 0.
            // Some logging might go to stderr.
          }
          res.json({ output: stdout });

        } catch (error: any) {
          if (error.killed) {
            return res.json({
              output: '',
              error: { type: 'TIME_LIMIT_EXCEEDED', message: 'Time Limit Exceeded', line: null }
            });
          }

          const stderr = error.stderr || error.message || '';
          let filteredStderr = cleanStderr(stderr);

          // Distinguish checking logic?
          // Python: SyntaxError vs NameError/etc
          const parsed = parseError(filteredStderr, language, lineOffset, code);

          // Heuristic for compilation vs runtime for interpreted
          let type = 'RUNTIME_ERROR';
          if (language === 'python' && filteredStderr.includes('SyntaxError')) type = 'COMPILATION_ERROR';
          if (language === 'javascript' && filteredStderr.includes('SyntaxError')) type = 'COMPILATION_ERROR';

          res.json({
            output: error.stdout || '',
            error: {
              type: type,
              message: parsed.message,
              line: parsed.line
            }
          });
        }
      }
    } finally {
      executionLimiter.release();
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Execution failed' });
  }
});

function cleanStderr(stderr: string): string {
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

function parseError(stderr: string, language: string, lineOffset: number, userCode?: string): { message: string, line: number | null } {
  let line: number | null = null;
  let message = stderr;

  // Common patterns
  // C/C++: /tmp/code.c:5:1: error: ...
  // Java: /tmp/Main.java:3: error: ...
  // Python: File "/tmp/code.py", line 2, in ...
  // JS: /tmp/code.js:2

  try {
    if (language === 'c' || language === 'cpp') {
      const match = stderr.match(/\/tmp\/code\.(?:c|cpp):(\d+):(\d+):/);
      if (match) {
        line = parseInt(match[1]);
      }
    } else if (language === 'java') {
      const match = stderr.match(/\/tmp\/Main\.java:(\d+):/);
      if (match) {
        line = parseInt(match[1]);
      }
    } else if (language === 'python') {
      const match = stderr.match(/File "\/tmp\/code\.py", line (\d+)/);
      if (match) {
        line = parseInt(match[1]);
      }
    } else if (language === 'javascript') {
      const match = stderr.match(/\/tmp\/code\.js:(\d+)/);
      if (match) {
        line = parseInt(match[1]);
      }
    }

    if (line !== null) {
      line = line - lineOffset;
      if (line < 1) line = 1; // Fallback

      // Heuristic: Fix off-by-one for missing semicolon in C/C++
      if ((language === 'c' || language === 'cpp') && userCode && stderr.includes("' before")) {
        // Typical error: "expected ';' before 'return'"
        // Or "expected ',' or ';' before"
        const lines = userCode.split('\n');
        const problematicLineIndex = line - 1; // 0-based index

        // If line reports error at N, check N-1
        if (problematicLineIndex > 0) {
          const prevLine = lines[problematicLineIndex - 1].trim();
          // If previous line exists, is not a comment, and doesn't end in; or } or {
          if (prevLine && !prevLine.startsWith('//') && !prevLine.endsWith(';') && !prevLine.endsWith('}') && !prevLine.endsWith('{') && !prevLine.endsWith('>')) {
            line = line - 1;
          }
        }
      }
    }
  } catch (e) {
    // ignore parsing error
  }

  return { message, line };
}

export default router;
