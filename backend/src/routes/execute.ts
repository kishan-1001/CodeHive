import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const router = Router();
const execAsync = promisify(exec);

interface ExecuteRequest {
  code: string;
  language: string;
}

router.post('/', async (req, res) => {
  const { code, language }: ExecuteRequest = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  try {
    let command: string;
    let image: string;

    const encodedCode = Buffer.from(code).toString('base64');

    switch (language) {
      case 'c':
        image = 'gcc';
        command = `echo '${encodedCode}' | base64 -d > /tmp/code.c && gcc /tmp/code.c -o /tmp/code && /tmp/code`;
        break;
      case 'cpp':
        image = 'gcc';
        command = `echo '${encodedCode}' | base64 -d > /tmp/code.cpp && g++ /tmp/code.cpp -o /tmp/code && /tmp/code`;
        break;
      case 'python':
        image = 'python';
        command = `echo '${encodedCode}' | base64 -d > /tmp/code.py && python /tmp/code.py`;
        break;
      case 'javascript':
        image = 'node';
        command = `echo '${encodedCode}' | base64 -d > /tmp/code.js && node /tmp/code.js`;
        break;
      case 'java':
        image = 'openjdk';
        command = `echo '${encodedCode}' | base64 -d > /tmp/Main.java && javac /tmp/Main.java && java -cp /tmp Main`;
        break;
      default:
        return res.status(400).json({ error: 'Unsupported language' });
    }

    const dockerCommand = `docker run --rm -i ${image} sh -c "${command}"`;

    const { stdout, stderr } = await execAsync(dockerCommand, { timeout: 10000 });

    const output = stdout || stderr || 'No output';

    res.json({ output });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Execution failed' });
  }
});

export default router;
