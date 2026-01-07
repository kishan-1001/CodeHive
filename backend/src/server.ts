import app from './app';
import { spawn } from 'child_process';
import { exec } from 'child_process';
import { promisify } from 'util';
import WebSocket from 'ws';
import { pool } from './config/db';

const execAsync = promisify(exec);

async function isDockerRunning(): Promise<boolean> {
  try {
    await execAsync('docker ps');
    return true;
  } catch {
    return false;
  }
}

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// WebSocket server for interactive execution
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  let currentProcess: any = null;

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'run') {
        // Start execution
        const { code, language, input, problem_id } = data;

        // Kill any existing process
        if (currentProcess) {
          currentProcess.kill();
        }

        let command: string;
        let args: string[] = [];

        const encodedCode = Buffer.from(code).toString('base64');

        // Fetch wrapper code if problem_id is provided
        let wrapperCode = '';
        if (problem_id) {
          const templateResult = await pool.query(`
            SELECT wrapper_code
            FROM problem_templates
            WHERE problem_id = $1 AND language = $2
          `, [problem_id, language]);

          if (templateResult.rows.length > 0) {
            wrapperCode = templateResult.rows[0].wrapper_code;
          }
        }

        // Combine user code with wrapper code
        let fullCode = code;
        if (wrapperCode) {
          // Replace placeholder in wrapper code with user code
          fullCode = wrapperCode.replace('// <<< INSERT USER CODE HERE >>>', code);
        }

        const encodedFullCode = Buffer.from(fullCode).toString('base64');

        let processedInput = input;
        if (language === 'cpp' && input) {
          const inputStr = Buffer.from(input, 'base64').toString();
          if (inputStr.startsWith('nums = [')) {
            const match = inputStr.match(/nums = \[([^\]]+)\], target = (\d+)/);
            if (match) {
              const numsStr = match[1];
              const target = match[2];
              const nums = numsStr.split(',').map(s => s.trim());
              const newInput = nums.join(' ') + '\n' + target;
              processedInput = Buffer.from(newInput).toString('base64');
            }
          }
        }
        const encodedInput = processedInput ? Buffer.from(processedInput).toString('base64') : null;

        let dockerCommand: string;
        let image: string;

        // Check if Docker is running
        if (!(await isDockerRunning())) {
          ws.send(JSON.stringify({ type: 'error', message: 'Docker is not running. Please start Docker Desktop to execute code.' }));
          return;
        }

        switch (language) {
          case 'python':
            image = 'python:3.9-alpine';
            dockerCommand = `echo "${encodedFullCode}" | base64 -d > /tmp/code.py`;
            if (encodedInput) {
              dockerCommand += ` && echo "${encodedInput}" | base64 -d | python3 -u /tmp/code.py`;
            } else {
              dockerCommand += ` && python3 -u /tmp/code.py`;
            }
            break;
          case 'javascript':
            image = 'node:18-alpine';
            dockerCommand = `echo "${encodedFullCode}" | base64 -d > /tmp/code.js`;
            if (encodedInput) {
              dockerCommand += ` && echo "${encodedInput}" | base64 -d | node /tmp/code.js`;
            } else {
              dockerCommand += ` && node /tmp/code.js`;
            }
            break;
          case 'c':
            image = 'gcc:latest';
            dockerCommand = `echo "${encodedFullCode}" | base64 -d > /tmp/code.c && gcc /tmp/code.c -o /tmp/code`;
            if (encodedInput) {
              dockerCommand += ` && echo "${encodedInput}" | base64 -d | stdbuf -o0 /tmp/code`;
            } else {
              dockerCommand += ` && stdbuf -o0 /tmp/code`;
            }
            break;
          case 'cpp':
            image = 'gcc:latest';
            dockerCommand = `echo "${encodedFullCode}" | base64 -d > /tmp/code.cpp && g++ /tmp/code.cpp -o /tmp/code`;
            if (encodedInput) {
              dockerCommand += ` && echo "${encodedInput}" | base64 -d | stdbuf -o0 /tmp/code`;
            } else {
              dockerCommand += ` && stdbuf -o0 /tmp/code`;
            }
            break;
          case 'java':
            image = 'eclipse-temurin:17-jdk-alpine';
            dockerCommand = `echo "${encodedFullCode}" | base64 -d > /tmp/Main.java && javac /tmp/Main.java`;
            if (encodedInput) {
              dockerCommand += ` && echo "${encodedInput}" | base64 -d | java -cp /tmp Main`;
            } else {
              dockerCommand += ` && java -cp /tmp Main`;
            }
            break;
          default:
            ws.send(JSON.stringify({ type: 'error', message: 'Unsupported language' }));
            return;
        }

        console.log('Spawning Docker process with command:', dockerCommand);

        currentProcess = spawn('docker', ['run', '--rm', '-i', image, 'sh', '-c', dockerCommand], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        // Send ready signal immediately
        ws.send(JSON.stringify({ type: 'ready' }));

        currentProcess.stdout.on('data', (data: Buffer) => {
          console.log('Received stdout data:', data.toString());
          ws.send(JSON.stringify({ type: 'output', data: data.toString() }));
        });

        currentProcess.stderr.on('data', (data: Buffer) => {
          console.log('Received stderr data:', data.toString());
          ws.send(JSON.stringify({ type: 'output', data: data.toString() }));
        });

        currentProcess.on('close', (code: number) => {
          console.log('Process closed with code:', code);
          ws.send(JSON.stringify({ type: 'end' }));
          currentProcess = null;
        });

        currentProcess.on('error', (error: Error) => {
          console.log('Process error:', error.message);
          ws.send(JSON.stringify({ type: 'error', message: error.message }));
          currentProcess = null;
        });

      } else if (data.type === 'input') {
        // Send input to the running process
        if (currentProcess && currentProcess.stdin) {
          currentProcess.stdin.write(data.data + '\n');
        }
      } else if (data.type === 'stop') {
        // Stop the current process
        if (currentProcess) {
          currentProcess.kill();
          currentProcess = null;
        }
      }
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    if (currentProcess) {
      currentProcess.kill();
      currentProcess = null;
    }
  });
});
