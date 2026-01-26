import { Router } from 'express';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { pool } from '../config/db';
import { authenticateToken } from '../middleware/auth';
import { StaticAnalyzerService } from '../services/staticAnalyzer';
import { executionLimiter } from '../utils/executionLimiter';

const router = Router();
const execAsync = promisify(exec);

interface SubmitRequest {
  code: string;
  language: string;
  problem_id: number;
}

async function isDockerRunning(): Promise<boolean> {
  try {
    await execAsync('docker ps');
    return true;
  } catch {
    return false;
  }
}



async function runTestCase(code: string, language: string, input: string, timeLimitMs: number = 2000): Promise<{ output: string; error?: string; runtime?: number }> {
  const startTime = Date.now();
  const timeLimitSec = Math.max(1, Math.ceil(timeLimitMs / 1000));

  const encodedCode = Buffer.from(code).toString('base64');

  // Process input for special cases
  let processedInput = input;
  if ((language === 'cpp' || language === 'c' || language === 'java' || language === 'python' || language === 'javascript') && input) {
    if (input.startsWith('nums = [')) {
      const match = input.match(/nums = \[([^\]]+)\], target = (\d+)/);
      if (match) {
        const numsStr = match[1];
        const target = match[2];
        const nums = numsStr.split(',').map(s => s.trim());
        const newInput = nums.join(' ') + '\n' + target;
        processedInput = newInput;
      }
    }
  }
  const encodedInput = (processedInput !== undefined && processedInput !== null) ? Buffer.from(processedInput).toString('base64') : null;

  let image: string;
  let script: string;

  // Construct the shell script to run inside the container
  // We use "cat <<EOF" or simple echo pipes. 
  // Using pipes with base64 ensures safe handling of special chars and large sizes.

  switch (language) {
    case 'c':
      image = 'gcc:latest';
      script = `
        echo "${encodedCode}" | base64 -d > /tmp/code.c
        gcc /tmp/code.c -o /tmp/code || exit 1
        ${encodedInput !== null ? `echo "${encodedInput}" | base64 -d > /tmp/input.txt` : 'touch /tmp/input.txt'}
        timeout ${timeLimitSec}s /tmp/code < /tmp/input.txt
      `;
      break;
    case 'cpp':
      image = 'gcc:latest';
      script = `
        echo "${encodedCode}" | base64 -d > /tmp/code.cpp
        g++ -O3 /tmp/code.cpp -o /tmp/code || exit 1
        ${encodedInput !== null ? `echo "${encodedInput}" | base64 -d > /tmp/input.txt` : 'touch /tmp/input.txt'}
        timeout ${timeLimitSec}s /tmp/code < /tmp/input.txt
      `;
      break;
    case 'python':
      image = 'python:3.9-alpine';
      script = `
        echo "${encodedCode}" | base64 -d > /tmp/code.py
        ${encodedInput !== null ? `echo "${encodedInput}" | base64 -d > /tmp/input.txt` : 'touch /tmp/input.txt'}
        timeout ${timeLimitSec}s python3 -u /tmp/code.py < /tmp/input.txt
      `;
      break;
    case 'javascript':
      image = 'node:18-alpine';
      script = `
        echo "${encodedCode}" | base64 -d > /tmp/code.js
        ${encodedInput !== null ? `echo "${encodedInput}" | base64 -d > /tmp/input.txt` : 'touch /tmp/input.txt'}
        timeout ${timeLimitSec}s node --input-type=module /tmp/code.js < /tmp/input.txt
      `;
      break;
    case 'java':
      image = 'amazoncorretto:11';
      script = `
        echo "${encodedCode}" | base64 -d > /tmp/Main.java
        javac /tmp/Main.java || exit 1
        ${encodedInput !== null ? `echo "${encodedInput}" | base64 -d > /tmp/input.txt` : 'touch /tmp/input.txt'}
        timeout ${timeLimitSec}s java -cp /tmp Main < /tmp/input.txt
      `;
      break;
    default:
      throw new Error('Unsupported language');
  }

  return new Promise((resolve, reject) => {
    const child = spawn('docker', ['run', '--rm', '-i', image, 'sh']);

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    child.on('close', (code) => {
      const runtime = Date.now() - startTime;

      // Filter stderr noise
      let filteredStderr = stderrData;
      if (stderrData) {
        const lines = stderrData.split('\n');
        filteredStderr = lines.filter(line =>
          !line.includes('Pulling') && !line.includes('Digest') && !line.includes('Status') && !line.includes('Waiting')
        ).join('\n').trim();
      }

      // Check exit codes
      if (code === 124) { // Timeout specific exit code
        resolve({ output: stdoutData.trim(), error: 'TLE', runtime });
        return;
      }

      // Compilation Error detection (non-zero exit + error message)
      if (code !== 0) {
        if (['c', 'cpp', 'java'].includes(language) && filteredStderr.toLowerCase().includes('error')) {
          resolve({ output: filteredStderr, error: 'CE', runtime });
          return;
        }
        if (['python', 'javascript'].includes(language) && (filteredStderr.includes('SyntaxError') || filteredStderr.includes('IndentationError'))) {
          resolve({ output: filteredStderr, error: 'CE', runtime });
          return;
        }
        // General Runtime Error if not TLE or CE
        resolve({ output: stdoutData.trim(), error: 'RE', runtime });
        return;
      }

      resolve({ output: stdoutData.trim(), runtime });
    });

    child.on('error', (err) => {
      reject(err);
    });

    // Write the script to stdin and close it
    child.stdin.write(script);
    child.stdin.end();
  });
}

router.post('/', authenticateToken, async (req, res) => {
  const { code, language, problem_id }: SubmitRequest = req.body;
  const user_id = (req as any).user.id;

  if (!code || !language || !problem_id) {
    return res.status(400).json({ error: 'Code, language, and problem_id are required' });
  }


  try {
    // Check Concurrency Limit
    if (!executionLimiter.tryAcquire()) {
      return res.status(429).json({
        error: 'Server is currently busy (max 3 concurrent executions). Please wait a moment and try again.'
      });
    }

    try {
      // Check if Docker is running
      if (!(await isDockerRunning())) {
        throw new Error('Docker is not running. Please start Docker Desktop to execute code.');
      }

      // Fetch wrapper code
      let wrapperCode = '';
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

      // Combine user code with wrapper code
      let fullCode = code;
      if (wrapperCode) {
        fullCode = wrapperCode.replace('// <<< INSERT USER CODE HERE >>>', code).replace('# <<< INSERT USER CODE HERE >>>', code);
      }

      // Fetch all test cases
      const testCasesResult = await pool.query(`
        SELECT id, input, expected_output
        FROM test_cases
        WHERE problem_id = $1
        ORDER BY id
      `, [problem_id]);

      if (testCasesResult.rows.length === 0) {
        return res.status(400).json({ error: 'No test cases found for this problem' });
      }

      const testCases = testCasesResult.rows;
      let allPassed = true;
      let totalRuntime = 0;
      let maxMemory = 0; // We'll track this later if needed

      // Fetch problem details for time limit
      let baseTimeLimitMs = 2000;
      try {
        console.log(`[DEBUG] Fetching time_limit_ms for problem ${problem_id}`);
        const problemResult = await pool.query('SELECT time_limit_ms FROM problems WHERE id = $1', [problem_id]);
        if (problemResult.rows.length > 0 && problemResult.rows[0].time_limit_ms) {
          baseTimeLimitMs = Number(problemResult.rows[0].time_limit_ms);
        }
        console.log(`[DEBUG] Base time limit: ${baseTimeLimitMs}ms`);
      } catch (err) {
        console.warn('[DEBUG] Failed to fetch time_limit_ms, using default 2000ms:', err);
      }

      // Apply language-specific multipliers
      let timeMultiplier = 1.0;
      switch (language) {
        case 'java':
          timeMultiplier = 2.0;
          break;
        case 'python':
        case 'javascript':
          timeMultiplier = 3.0;
          break;
        case 'c':
        case 'cpp':
        default:
          timeMultiplier = 1.0;
          break;
      }

      const finalTimeLimitMs = Math.ceil(baseTimeLimitMs * timeMultiplier);
      console.log(`[DEBUG] Applied ${timeMultiplier}x multiplier for ${language}. Final limit: ${finalTimeLimitMs}ms`);

      // Run code against each test case
      for (const testCase of testCases) {
        console.log(`[DEBUG] executing test case input: ${testCase.input}`);
        console.log(`[DEBUG] Full Code being executed:\n${fullCode}`);
        const result = await runTestCase(fullCode, language, testCase.input, finalTimeLimitMs);

        if (result.error === 'CE') {
          // Compilation Error
          await pool.query(`
              INSERT INTO submissions (
                user_id, problem_id, language, code, verdict, 
                runtime_ms, memory_kb, complexity_source
              )
              VALUES ($1, $2, $3, $4, 'CE', 0, 0, 'unknown')
            `, [user_id, problem_id, language, code]);

          return res.json({ verdict: 'compilation_error', message: 'Compilation Error', output: result.output });
        }

        if (result.error === 'TLE') {
          // Time Limit Exceeded
          await pool.query(`
            INSERT INTO submissions (user_id, problem_id, language, code, verdict, runtime_ms, memory_kb, complexity_source)
            VALUES ($1, $2, $3, $4, 'TLE', $5, $6, 'unknown')
          `, [user_id, problem_id, language, code, result.runtime || 0, maxMemory]);

          return res.json({ verdict: 'time_limit_exceeded', message: 'Time Limit Exceeded' });
        } else if (result.error === 'RE') {
          // Runtime Error
          await pool.query(`
            INSERT INTO submissions (user_id, problem_id, language, code, verdict, runtime_ms, memory_kb, complexity_source)
            VALUES ($1, $2, $3, $4, 'RE', $5, $6, 'unknown')
          `, [user_id, problem_id, language, code, result.runtime || 0, maxMemory]);

          return res.json({ verdict: 'runtime_error', message: 'Runtime Error', output: result.output });
        } else if (result.output !== testCase.expected_output.trim()) {
          // Wrong Answer
          allPassed = false;
          totalRuntime += result.runtime || 0;

          await pool.query(`
            INSERT INTO submissions (user_id, problem_id, language, code, verdict, runtime_ms, memory_kb, complexity_source)
            VALUES ($1, $2, $3, $4, 'WA', $5, $6, 'unknown')
          `, [user_id, problem_id, language, code, result.runtime || 0, maxMemory]);

          // Stop execution on first wrong answer to save resources
          break;
        } else {
          totalRuntime += result.runtime || 0;
        }
      }

      // Check if loop broke early due to WA
      if (!allPassed) {
        return res.json({ verdict: 'wrong_answer', message: 'Wrong Answer' });
      }

      // Determine final verdict
      const verdict = 'AC';
      const averageRuntime = Math.round(totalRuntime / testCases.length);

      // 🟢 STATIC ANALYSIS (Only if AC)
      let timeComplexity = 'N/A';
      let spaceComplexity = 'N/A';

      try {
        const analysis = await StaticAnalyzerService.analyze(code, language);
        timeComplexity = analysis.timeComplexity;
        spaceComplexity = analysis.spaceComplexity;
      } catch (err) {
        console.error("Static Analysis Failed:", err);
      }

      // Save submission to database with Static Metrics
      await pool.query(`
        INSERT INTO submissions (
          user_id, problem_id, language, code, verdict, 
          runtime_ms, memory_kb, 
          time_complexity_static, space_complexity_static,
          complexity_source
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'static')
      `, [user_id, problem_id, language, code, verdict, averageRuntime, maxMemory, timeComplexity, spaceComplexity]);

      // Return result to frontend
      res.json({
        verdict: 'accepted',
        message: 'All test cases passed!',
        analysis: {
          time: timeComplexity,
          space: spaceComplexity
        }
      });
    } finally {
      executionLimiter.release();
    }

  } catch (error: any) {
    console.error('Submission error:', error);
    res.status(500).json({ error: error.message || 'Submission failed' });
  }
});

export default router;
