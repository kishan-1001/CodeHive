import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { pool } from '../config/db';
import { CodeExecutionService } from '../services/CodeExecutionService';

const router = express.Router();

router.post('/', async (req, res) => {
  const { code, language, input, problemId } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  try {
    let fullCode = code;
    let lineOffset = 0;

    // Add wrapper code for specific problems if applicable
    if (problemId) {
      const { rows } = await pool.query(
        'SELECT wrapper_code FROM admin_templates WHERE problem_id = $1 AND language = $2',
        [problemId, language]
      );
      if (rows.length > 0 && rows[0].wrapper_code) {
        fullCode = `${code}\n\n${rows[0].wrapper_code}`;
        lineOffset = code.split('\n').length + 2;
      }
    }

    const processedInput = input !== undefined && input !== null ? input.toString() : '';

    const result = await CodeExecutionService.execute(fullCode, language, processedInput, 10000, lineOffset);

    if (result.error) {
      return res.json({
        output: result.output,
        error: {
          type: result.error.type,
          message: result.error.message,
          line: result.error.line,
          warnings: result.error.warnings
        }
      });
    }

    res.json({ output: result.output });

  } catch (error: any) {
    console.error('Execution error:', error);
    res.status(500).json({ error: 'Execution failed', details: error.message });
  }
});

export default router;
