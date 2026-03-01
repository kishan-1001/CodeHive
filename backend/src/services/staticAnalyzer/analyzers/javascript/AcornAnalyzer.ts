import * as acorn from 'acorn';
import { IStaticAnalyzer, StaticAnalysisResult } from '../interface';

export class AcornAnalyzer implements IStaticAnalyzer {
    async analyze(code: string): Promise<StaticAnalysisResult> {
        try {
            // @ts-ignore
            const ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: 'module' });
            return this.analyzeAst(ast, code);
        } catch (e) {
            try {
                // @ts-ignore
                const ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: 'script' });
                return this.analyzeAst(ast, code);
            } catch (e2) {
                return { timeComplexity: 'Error', spaceComplexity: 'Error', isSafe: false, warnings: ['Security Violation: Invalid JavaScript syntax or parsing failure.'] };
            }
        }
    }

    private analyzeAst(ast: any, code: string): StaticAnalysisResult {
        let maxLoopDepth = 0;
        let hasArrayAllocationInLoop = false;
        const warnings: string[] = [];
        let isSafe = true;

        const traverse = (node: any, depth: number) => {
            if (!node) return;
            let currentDepth = depth;

            if (['ForStatement', 'WhileStatement', 'DoWhileStatement', 'ForInStatement', 'ForOfStatement'].includes(node.type)) {
                currentDepth++;
                maxLoopDepth = Math.max(maxLoopDepth, currentDepth);
            }

            // --- Safety Checks (In-AST) ---

            const blockedGlobals = ['process', 'global', 'globalThis', 'module', 'exports', 'require', '__dirname', '__filename'];
            if (node.type === 'Identifier' && blockedGlobals.includes(node.name)) {
                isSafe = false;
                warnings.push(`Security Violation: Use of blocked global/identifier: ${node.name}`);
            }

            if (node.type === 'NewExpression' && node.callee.name === 'Function') {
                isSafe = false;
                warnings.push('Security Violation: Use of Function constructor detected.');
            }

            if (node.type === 'NewExpression' && node.callee.name === 'Array') {
                if (currentDepth > 0) hasArrayAllocationInLoop = true;
            }

            for (const key in node) {
                const child = node[key];
                if (Array.isArray(child)) {
                    child.forEach(c => traverse(c, currentDepth));
                } else if (typeof child === 'object' && child !== null && child.type) {
                    traverse(child, currentDepth);
                }
            }
        };

        traverse(ast, 0);

        // --- Additional Regex Safety Checks ---
        const blockedKeywords = ['eval', 'setTimeout', 'setInterval', 'setImmediate', 'fs', 'child_process', 'path', 'os', 'http', 'https', 'net', 'dns', 'cluster'];
        blockedKeywords.forEach(kw => {
            const regex = new RegExp(`\\b${kw}\\b`, 'g');
            if (regex.test(code)) {
                isSafe = false;
                warnings.push(`Security Violation: Blocked keyword/module detected: ${kw}`);
            }
        });

        // Complexity Estimation
        let timeComplexity = 'O(1)';
        if (maxLoopDepth === 1) timeComplexity = 'O(n)';
        else if (maxLoopDepth === 2) timeComplexity = 'O(n^2)';
        else if (maxLoopDepth >= 3) timeComplexity = `O(n^${maxLoopDepth})`;

        let spaceComplexity = 'O(1)';
        if (code.match(/new\s+Array\(/) || code.match(/\[.*[a-zA-Z].*\]/)) spaceComplexity = 'O(n)';
        if (hasArrayAllocationInLoop) spaceComplexity = 'O(n^2)';

        return { timeComplexity, spaceComplexity, isSafe, warnings };
    }
}
