import express from 'express';
import { pool } from '../config/db';
import { CodeExecutionService } from '../services/CodeExecutionService';

const router = express.Router();

router.post('/', async (req, res) => {
  // Accept both camelCase (problemId) and snake_case (problem_id) — frontend sends snake_case
  const { code, language, input, problemId, problem_id } = req.body;
  const resolvedProblemId = problemId ?? problem_id;

  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  try {
    let fullCode = code;
    let lineOffset = 0;

    // Add wrapper code for specific problems if applicable (same table & pattern as submit.ts)
    if (resolvedProblemId) {
      const { rows } = await pool.query(
        'SELECT wrapper_code FROM problem_templates WHERE problem_id = $1 AND language = $2',
        [resolvedProblemId, language]
      );
      if (rows.length > 0 && rows[0].wrapper_code) {
        const wrapperCode: string = rows[0].wrapper_code;
        // Inject user code at the placeholder, exactly like submit.ts does
        const placeholder = '// <<< INSERT USER CODE HERE >>>';
        const pyPlaceholder = '# <<< INSERT USER CODE HERE >>>';
        if (wrapperCode.includes(placeholder) || wrapperCode.includes(pyPlaceholder)) {
          fullCode = wrapperCode
            .replace(placeholder, code)
            .replace(pyPlaceholder, code);
          // lineOffset = lines before placeholder so error lines map back to user's code
          const usedPlaceholder = wrapperCode.includes(placeholder) ? placeholder : pyPlaceholder;
          lineOffset = wrapperCode.substring(0, wrapperCode.indexOf(usedPlaceholder)).split('\n').length - 1;
        } else {
          // Fallback: wrapper goes first (headers), then user code
          fullCode = `${wrapperCode}\n\n${code}`;
          lineOffset = wrapperCode.split('\n').length + 2;
        }
      }
    }

    // Preprocess input — same transformations as submit.ts so the wrapper's main() gets
    // the correct stdin format (e.g. "nums = [2,7,11,15], target = 9" → "2 7 11 15\n9")
    let processedInput = input !== undefined && input !== null ? input.toString() : '';
    if (processedInput && (language === 'cpp' || language === 'c' || language === 'java' || language === 'python' || language === 'javascript')) {
      if (processedInput.startsWith('nums = [')) {
        const match = processedInput.match(/nums = \[([^\]]+)\], target = (-?\d+)/);
        if (match) {
          const nums = match[1].split(',').map((s: string) => s.trim());
          processedInput = nums.join(' ') + '\n' + match[2];
        }
      }
    }

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
