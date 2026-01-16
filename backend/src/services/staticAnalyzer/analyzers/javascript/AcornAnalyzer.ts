import * as acorn from 'acorn';
import { IStaticAnalyzer, StaticAnalysisResult } from '../interface';

export class AcornAnalyzer implements IStaticAnalyzer {
    async analyze(code: string): Promise<StaticAnalysisResult> {
        try {
            // @ts-ignore - Acorn types might not be perfect matching our strict compilation
            const ast = acorn.parse(code, { ecmaVersion: 2020 });
            return this.analyzeAst(ast, code);
        } catch (e) {
            console.error("Acorn parsing failed:", e);
            // Fallback object
            return { timeComplexity: 'Error', spaceComplexity: 'Error' };
        }
    }

    private analyzeAst(ast: any, code: string): StaticAnalysisResult {
        let maxLoopDepth = 0;
        let hasArrayAllocationInLoop = false;
        let hasRecursiveCalls = false;

        // Recursive traversal function
        const traverse = (node: any, depth: number) => {
            if (!node) return;

            let currentDepth = depth;

            // Check for Loop types
            if (['ForStatement', 'WhileStatement', 'DoWhileStatement', 'ForInStatement', 'ForOfStatement'].includes(node.type)) {
                currentDepth++;
                maxLoopDepth = Math.max(maxLoopDepth, currentDepth);
            }

            // Check for Array Allocation (e.g., new Array(n))
            if (node.type === 'NewExpression' && node.callee.name === 'Array') {
                if (currentDepth > 0) hasArrayAllocationInLoop = true;
            }

            // Recurse into specific keys where children might live
            for (const key in node) {
                if (key === 'body' || key === 'consequent' || key === 'alternate' || key === 'elements' || key === 'arguments' || key === 'declarations' || key === 'init' || key === 'update' || key === 'block') {
                    const child = node[key];
                    if (Array.isArray(child)) {
                        child.forEach(c => traverse(c, currentDepth));
                    } else if (typeof child === 'object' && child !== null && child.type) {
                        traverse(child, currentDepth);
                    }
                }
            }
        };

        traverse(ast, 0);

        // Determine Time Complexity
        let timeComplexity = 'O(1)';
        if (maxLoopDepth === 1) timeComplexity = 'O(n)';
        else if (maxLoopDepth === 2) timeComplexity = 'O(n^2)';
        else if (maxLoopDepth >= 3) timeComplexity = `O(n^${maxLoopDepth})`;

        // Determine Space Complexity
        // Simplified: if generic allocation found inside loop -> O(n) or O(n^2)
        // If simply 'new Array(n)' at top level -> O(n)
        let spaceComplexity = 'O(1)';

        // Simple regex check for 'new Array' or '[]' with variable size as a backup since AST traversal for specific allocation variants is complex
        if (code.match(/new\s+Array\(/) || code.match(/\[.*[a-zA-Z].*\]/)) {
            spaceComplexity = 'O(n)';
        }

        if (hasArrayAllocationInLoop) {
            spaceComplexity = 'O(n^2)'; // Conservatively
        }

        return { timeComplexity, spaceComplexity };
    }
}
