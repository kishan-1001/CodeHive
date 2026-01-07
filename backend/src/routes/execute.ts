import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { pool } from '../config/db';

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
        // Ignore database errors for wrapper code - it's optional
        console.warn('Could not fetch wrapper code:', dbError);
      }
    }

    // Combine user code with wrapper code
    let fullCode = code;
    if (wrapperCode) {
      // Replace placeholder in wrapper code with user code
      fullCode = wrapperCode.replace('// <<< INSERT USER CODE HERE >>>', code);
    }

    let command: string;
    let image: string;

    const encodedCode = Buffer.from(fullCode).toString('base64');

    let processedInput = input;
    if (language === 'cpp' && input) {
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
          command += ` && echo "${encodedInput}" | base64 -d | /tmp/code`;
        } else {
          command += ` && /tmp/code`;
        }
        break;
      case 'cpp':
        image = 'gcc:latest';
        command = `echo "${encodedCode}" | base64 -d > /tmp/code.cpp && g++ /tmp/code.cpp -o /tmp/code`;
        if (encodedInput) {
          command += ` && echo "${encodedInput}" | base64 -d | /tmp/code`;
        } else {
          command += ` && /tmp/code`;
        }
        break;
      case 'python':
        image = 'python:3.9-alpine';
        command = `echo "${encodedCode}" | base64 -d > /tmp/code.py`;
        if (encodedInput) {
          command += ` && echo "${encodedInput}" | base64 -d | python3 -u /tmp/code.py`;
        } else {
          command += ` && python3 -u /tmp/code.py`;
        }
        break;
      case 'javascript':
        image = 'node:18-alpine';
        command = `echo "${encodedCode}" | base64 -d > /tmp/code.js`;
        if (encodedInput) {
          command += ` && echo "${encodedInput}" | base64 -d | node --input-type=module /tmp/code.js`;
        } else {
          command += ` && node --input-type=module /tmp/code.js`;
        }
        break;
      case 'java':
        image = 'openjdk:11-jdk-alpine';
        command = `echo "${encodedCode}" | base64 -d > /tmp/Main.java && javac /tmp/Main.java`;
        if (encodedInput) {
          command += ` && echo "${encodedInput}" | base64 -d | java -cp /tmp Main`;
        } else {
          command += ` && java -cp /tmp Main`;
        }
        break;
      default:
        return res.status(400).json({ error: 'Unsupported language' });
    }

    // Check if Docker is running
    if (!(await isDockerRunning())) {
      throw new Error('Docker is not running. Please start Docker Desktop to execute code.');
    }

    const dockerCommand = `docker run --rm -i ${image} sh -c "${command}"`;

    console.log('Executing Docker command:', dockerCommand);

    const { stdout, stderr } = await execAsync(dockerCommand, { timeout: 10000 });

    console.log('Docker stdout:', stdout);
    console.log('Docker stderr:', stderr);

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

    const output = stdout || filteredStderr || 'No output';

    res.json({ output });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Execution failed' });
  }
});

export default router;
