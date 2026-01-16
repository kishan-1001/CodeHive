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

            // Pop stack if indentation decreases
            while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
                stack.pop();
            }

            const currentParent = stack[stack.length - 1].node;

            if (trimmed.startsWith('for ') || trimmed.startsWith('while ')) {
                const loopNode: AstNode = { type: 'Loop', start: 0, end: 0, children: [] };
                currentParent.children.push(loopNode);
                // Push to stack to capture children
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

        const traverse = (n: AstNode, depth: number) => {
            let d = depth;
            if (n.type === 'Loop') {
                d++;
                maxDepth = Math.max(maxDepth, d);
            }
            n.children.forEach(c => traverse(c, d));
        };
        traverse(node, 0);

        let timeComplexity = 'O(1)';
        if (maxDepth === 1) timeComplexity = 'O(n)';
        else if (maxDepth === 2) timeComplexity = 'O(n^2)';
        else if (maxDepth >= 3) timeComplexity = `O(n^${maxDepth})`;

        let spaceComplexity = 'O(1)';
        if (code.match(/\[.*for.*in.*\]/)) { // List comprehension
            spaceComplexity = 'O(n)';
        }
        if (code.match(/\[0\]\s*\*\s*[a-zA-Z]/)) { // [0] * n
            spaceComplexity = 'O(n)';
        }

        return { timeComplexity, spaceComplexity };
    }
}
