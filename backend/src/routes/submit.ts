import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { pool } from '../config/db';
import { authenticateToken } from '../middleware/auth';
import { StaticAnalyzerService } from '../services/staticAnalyzer';

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

async function runTestCase(code: string, language: string, input: string): Promise<{ output: string; error?: string; runtime?: number }> {
  const startTime = Date.now();

  let command: string;
  let image: string;

  const encodedCode = Buffer.from(code).toString('base64');

  // Process input for special cases (like C++ array inputs)
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
  const encodedInput = processedInput ? Buffer.from(processedInput).toString('base64') : null;

  switch (language) {
    case 'c':
      image = 'gcc:latest';
      command = `echo "${encodedCode}" | base64 -d > /tmp/code.c && gcc /tmp/code.c -o /tmp/code`;
      if (encodedInput) {
        command += ` && echo "${encodedInput}" | base64 -d | timeout 5 /tmp/code`;
      } else {
        command += ` && timeout 5 /tmp/code`;
      }
      break;
    case 'cpp':
      image = 'gcc:latest';
      command = `echo "${encodedCode}" | base64 -d > /tmp/code.cpp && g++ /tmp/code.cpp -o /tmp/code`;
      if (encodedInput) {
        command += ` && echo "${encodedInput}" | base64 -d | timeout 5 /tmp/code`;
      } else {
        command += ` && timeout 5 /tmp/code`;
      }
      break;
    case 'python':
      image = 'python:3.9-alpine';
      command = `echo "${encodedCode}" | base64 -d > /tmp/code.py`;
      if (encodedInput) {
        command += ` && echo "${encodedInput}" | base64 -d | timeout 5 python3 -u /tmp/code.py`;
      } else {
        command += ` && timeout 5 python3 -u /tmp/code.py`;
      }
      break;
    case 'javascript':
      image = 'node:18-alpine';
      command = `echo "${encodedCode}" | base64 -d > /tmp/code.js`;
      if (encodedInput) {
        command += ` && echo "${encodedInput}" | base64 -d | timeout 5 node --input-type=module /tmp/code.js`;
      } else {
        command += ` && timeout 5 node --input-type=module /tmp/code.js`;
      }
      break;
    case 'java':
      image = 'amazoncorretto:11';
      command = `echo "${encodedCode}" | base64 -d > /tmp/Main.java && javac /tmp/Main.java`;
      if (encodedInput) {
        command += ` && echo "${encodedInput}" | base64 -d | timeout 5 java -cp /tmp Main`;
      } else {
        command += ` && timeout 5 java -cp /tmp Main`;
      }
      break;
    default:
      throw new Error('Unsupported language');
  }

  try {
    const dockerCommand = `docker run --rm -i ${image} sh -c "${command}"`;
    const { stdout, stderr } = await execAsync(dockerCommand, { timeout: 60000 });

    const runtime = Date.now() - startTime;

    // Filter out Docker pull messages from stderr
    let filteredStderr = stderr;
    if (stderr) {
      const lines = stderr.split('\n');
      filteredStderr = lines.filter(line =>
        !line.includes('Pulling fs layer') &&
        !line.includes('Already exists') &&
        !line.includes('Pull complete') &&
        !line.includes('latest: Pulling from') &&
        !line.includes('Digest:') &&
        !line.includes('Status:') &&
        !line.includes('Unable to find image') &&
        !line.includes('1227bf08bd42:') &&
        !line.includes('b1741a62ccee:') &&
        !line.includes('add107facb26:') &&
        !line.includes('83237d80dc43:') &&
        !line.includes('1227bf08bd42:') &&
        !line.includes('83237d80dc43:')
      ).join('\n').trim();
    }

    // Check for Compilation Errors in compiled languages
    if (['c', 'cpp', 'java'].includes(language) && filteredStderr && filteredStderr.toLowerCase().includes('error')) {
      return { output: filteredStderr, error: 'CE', runtime };
    }
    // For interpreted languages (heuristic)
    if (['python', 'javascript'].includes(language) && filteredStderr && (filteredStderr.includes('SyntaxError') || filteredStderr.includes('IndentationError'))) {
      return { output: filteredStderr, error: 'CE', runtime };
    }

    const output = stdout || filteredStderr || '';

    return { output: output.trim(), runtime };
  } catch (error: any) {
    const runtime = Date.now() - startTime;

    // Check stderr for Compilation Errors first (g++ exit code 1)
    const stderr = error.stderr || '';
    if (['c', 'cpp', 'java'].includes(language) && stderr.toLowerCase().includes('error')) {
      return { output: stderr, error: 'CE', runtime };
    }
    if (['python', 'javascript'].includes(language) && (stderr.includes('SyntaxError') || stderr.includes('IndentationError'))) {
      return { output: stderr, error: 'CE', runtime };
    }

    // Check for Time Limit Exceeded
    // 124 is the exit code for the Linux 'timeout' command
    // 'ETIMEDOUT' is from Node's exec timeout
    if (error.code === 'ETIMEDOUT' || error.code === 124) {
      return { output: '', error: 'TLE', runtime };
    }

    return { output: '', error: error.message || 'RE', runtime };
  }
}

router.post('/', authenticateToken, async (req, res) => {
  const { code, language, problem_id }: SubmitRequest = req.body;
  const user_id = (req as any).user.id;

  if (!code || !language || !problem_id) {
    return res.status(400).json({ error: 'Code, language, and problem_id are required' });
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

    // Run code against each test case
    for (const testCase of testCases) {
      const result = await runTestCase(fullCode, language, testCase.input);

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

  } catch (error: any) {
    console.error('Submission error:', error);
    res.status(500).json({ error: error.message || 'Submission failed' });
  }
});

export default router;
