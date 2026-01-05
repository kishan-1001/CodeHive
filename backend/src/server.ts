import app from './app';
import { spawn } from 'child_process';
import WebSocket from 'ws';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// WebSocket server for interactive execution
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  let currentProcess: any = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'run') {
        // Start execution
        const { code, language } = data;

        // Kill any existing process
        if (currentProcess) {
          currentProcess.kill();
        }

        let command: string;
        let args: string[] = [];

        const encodedCode = Buffer.from(code).toString('base64');

        let dockerCommand: string;
        let image: string;

        switch (language) {
          case 'python':
            image = 'python:3.9-alpine';
            dockerCommand = `echo "${encodedCode}" | base64 -d > /tmp/code.py && python3 /tmp/code.py`;
            break;
          case 'javascript':
            image = 'node:18-alpine';
            dockerCommand = `echo "${encodedCode}" | base64 -d > /tmp/code.js && node /tmp/code.js`;
            break;
          case 'c':
            image = 'gcc:latest';
            dockerCommand = `echo "${encodedCode}" | base64 -d > /tmp/code.c && gcc /tmp/code.c -o /tmp/code && stdbuf -o0 /tmp/code`;
            break;
          case 'cpp':
            image = 'gcc:latest';
            dockerCommand = `echo "${encodedCode}" | base64 -d > /tmp/code.cpp && g++ /tmp/code.cpp -o /tmp/code && stdbuf -o0 /tmp/code`;
            break;
          case 'java':
            image = 'openjdk:11-jdk-alpine';
            dockerCommand = `echo "${encodedCode}" | base64 -d > /tmp/Main.java && javac /tmp/Main.java && java -cp /tmp Main`;
            break;
          default:
            ws.send(JSON.stringify({ type: 'error', message: 'Unsupported language' }));
            return;
        }

        currentProcess = spawn('docker', ['run', '--rm', '-i', image, 'sh', '-c', dockerCommand], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        // Send ready signal immediately
        ws.send(JSON.stringify({ type: 'ready' }));

        currentProcess.stdout.on('data', (data: Buffer) => {
          ws.send(JSON.stringify({ type: 'output', data: data.toString() }));
        });

        currentProcess.stderr.on('data', (data: Buffer) => {
          ws.send(JSON.stringify({ type: 'output', data: data.toString() }));
        });

        currentProcess.on('close', (code: number) => {
          ws.send(JSON.stringify({ type: 'end' }));
          currentProcess = null;
        });

        currentProcess.on('error', (error: Error) => {
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
