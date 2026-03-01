import { AbstractParser, AstNode } from '../ast/AbstractParser';
import { IStaticAnalyzer, StaticAnalysisResult } from '../interface';

export class PythonParser extends AbstractParser {
    parse(): AstNode {
        const lines = this.code.split('\n');
        const root: AstNode = { type: 'Program', start: 0, end: this.code.length, children: [] };

        let stack: { node: AstNode, indent: number }[] = [{ node: root, indent: -1 }];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            const indent = line.search(/\S/); // Count leading spaces

            while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
                stack.pop();
            }

            const currentParent = stack[stack.length - 1].node;

            if (trimmed.startsWith('for ') || trimmed.startsWith('while ')) {
                const loopNode: AstNode = { type: 'Loop', start: 0, end: 0, children: [] };
                currentParent.children.push(loopNode);
                stack.push({ node: loopNode, indent });
            }
        }
        return root;
    }
}

export class PythonAnalyzer implements IStaticAnalyzer {
    async analyze(code: string): Promise<StaticAnalysisResult> {
        const parser = new PythonParser(code);
        const ast = parser.parse();

        return this.analyzeAst(ast, code);
    }

    private analyzeAst(node: AstNode, code: string): StaticAnalysisResult {
        let maxDepth = 0;
        const warnings: string[] = [];
        let isSafe = true;

        const traverse = (n: AstNode, depth: number) => {
            let d = depth;
            if (n.type === 'Loop') {
                d++;
                maxDepth = Math.max(maxDepth, d);
            }
            n.children.forEach(c => traverse(c, d));
        };
        traverse(node, 0);

        // --- Safety Checks (The Hardened Bouncer) ---

        const blockedModules = [
            'os', 'subprocess', 'sys', 'shutil', 'socket', 'requests', 'urllib',
            'ftplib', 'smtplib', 'telnetlib', 'pickle', 'marshal', 'shelve',
            'sqlite3', 'pysqlite2', 'ctypes', 'winreg', 'msvcrt', 'platform', 'pty', 'builtins'
        ];

        for (const mod of blockedModules) {
            const regex = new RegExp(`\\b(import\\s+${mod}|from\\s+${mod}\\b)`, 'i');
            if (regex.test(code)) {
                isSafe = false;
                warnings.push(`Security Violation: Import of blocked module detected: ${mod}`);
            }
        }

        const blockedFunctions = [
            'eval', 'exec', 'open', 'compile', 'input', 'breakpoint',
            '__import__', 'globals', 'locals', 'vars', 'exit', 'quit', 'getattr', 'setattr', 'delattr'
        ];

        for (const fn of blockedFunctions) {
            const regex = new RegExp(`\\b${fn}\\s*\\(`, 'i');
            if (regex.test(code)) {
                isSafe = false;
                warnings.push(`Security Violation: Use of blocked function detected: ${fn}`);
            }
        }

        const suspiciousPatterns = [
            { pattern: /__subclasses__/i, name: 'class hierarchy exploration' },
            { pattern: /__builtins__/i, name: 'builtins access' },
            { pattern: /__getattribute__/i, name: 'low-level attribute access' },
            { pattern: /base64\s*\.\s*b64decode/i, name: 'obfuscated code' },
            { pattern: /codec\s*\.\s*decode/i, name: 'obfuscated code' },
            { pattern: /\\\s*\n/i, name: 'excessive line continuation' },
            { pattern: /chr\s*\(/i, name: 'character-based obfuscation' }
        ];

        suspiciousPatterns.forEach(sp => {
            if (sp.pattern.test(code)) {
                isSafe = false;
                warnings.push(`Security Violation: Suspicious pattern detected: ${sp.name}`);
            }
        });

        if (code.includes('__builtins__') && (code.includes('open') || code.includes('exec'))) {
            isSafe = false;
            warnings.push('Security Violation: Attempt to bypass bouncer via __builtins__');
        }

        // Complexity Estimation
        let timeComplexity = 'O(1)';
        if (maxDepth === 1) timeComplexity = 'O(n)';
        else if (maxDepth === 2) timeComplexity = 'O(n^2)';
        else if (maxDepth >= 3) timeComplexity = `O(n^${maxDepth})`;

        let spaceComplexity = 'O(1)';
        if (code.match(/\[.*for.*in.*\]/)) {
            spaceComplexity = 'O(n)';
        }
        if (code.match(/\[0\]\s*\*\s*[a-zA-Z]/)) {
            spaceComplexity = 'O(n)';
        }

        return { timeComplexity, spaceComplexity, isSafe, warnings };
    }
}
