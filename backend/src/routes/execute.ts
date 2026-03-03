import express from 'express';
import { pool } from '../config/db';
import { CodeExecutionService } from '../services/CodeExecutionService';
import { StaticAnalyzerService } from '../services/staticAnalyzer';
import { decodeHTMLEntities } from '../utils/htmlUtils';
import { preprocessInput } from '../utils/inputUtils';

const router = express.Router();

router.post('/', async (req, res) => {
  // Accept both camelCase (problemId) and snake_case (problem_id) — frontend sends snake_case
  const { code, language, input, problemId, problem_id } = req.body;
  const resolvedProblemId = problemId ?? problem_id;

  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  try {
    // 1. Security check on the RAW user code only (before wrapper injection)
    //    so wrapper internals (sys, process, java.util etc.) don't trigger false positives
    const analysis = await StaticAnalyzerService.analyze(code, language);
    if (!analysis.isSafe) {
      return res.json({
        output: '',
        error: {
          type: 'SECURITY_VIOLATION',
          message: 'Security Violation: Malicious code detected.',
          warnings: analysis.warnings
        }
      });
    }

    let fullCode = code;
    let lineOffset = 0;

    // 2. Inject wrapper code for problem-specific execution (same table & pattern as submit.ts)
    if (resolvedProblemId) {
      const { rows } = await pool.query(
        'SELECT wrapper_code FROM problem_templates WHERE problem_id = $1 AND language = $2',
        [resolvedProblemId, language]
      );
      if (rows.length > 0 && rows[0].wrapper_code) {
        const wrapperCode: string = decodeHTMLEntities(rows[0].wrapper_code);
        const placeholder = '// <<< INSERT USER CODE HERE >>>';
        const pyPlaceholder = '# <<< INSERT USER CODE HERE >>>';
        if (wrapperCode.includes(placeholder) || wrapperCode.includes(pyPlaceholder)) {
          fullCode = wrapperCode
            .replace(placeholder, code)
            .replace(pyPlaceholder, code);
          const usedPlaceholder = wrapperCode.includes(placeholder) ? placeholder : pyPlaceholder;
          lineOffset = wrapperCode.substring(0, wrapperCode.indexOf(usedPlaceholder)).split('\n').length - 1;
        } else {
          fullCode = `${wrapperCode}\n\n${code}`;
          lineOffset = wrapperCode.split('\n').length + 2;
        }
      }
    }

    // 3. Preprocess input — use robust utility for LeetCode format strings
    let processedInput = preprocessInput(input !== undefined && input !== null ? input.toString() : '');

    // 4. Execute after decoding any HTML entities (robustness for legacy data)
    const decodedCode = decodeHTMLEntities(fullCode);
    const result = await CodeExecutionService.execute(decodedCode, language, processedInput, 10000, lineOffset, true);

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
