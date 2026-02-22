import { AbstractParser, AstNode } from '../ast/AbstractParser';
import { IStaticAnalyzer, StaticAnalysisResult } from '../interface';

// Reusing Java logic but can be specialized if needed
export class CppParser extends AbstractParser {
    parse(): AstNode {
        const root: AstNode = { type: 'Program', start: 0, end: this.code.length, children: [] };

        while (this.pos < this.code.length) {
            this.skipWhitespace();
            if (this.pos >= this.code.length) break;

            if (this.match('for')) {
                root.children.push(this.parseLoop('ForStatement'));
            } else if (this.match('while')) {
                root.children.push(this.parseLoop('WhileStatement'));
            } else if (this.match('{')) {
                root.children.push(this.parseBlock());
            } else {
                this.consume();
            }
        }
        return root;
    }

    private parseLoop(type: string): AstNode {
        const start = this.pos;
        this.consumeWhile(c => c !== '{');

        const node: AstNode = { type, start, end: 0, children: [] };

        if (this.peek() === '{') {
            const block = this.parseBlock();
            node.children.push(block);
            node.end = block.end;
        } else {
            this.consume();
            node.end = this.pos;
        }
        return node;
    }

    private parseBlock(): AstNode {
        const start = this.pos;
        this.consume(); // eat '{'
        const node: AstNode = { type: 'Block', start, end: 0, children: [] };

        while (this.pos < this.code.length && this.peek() !== '}') {
            this.skipWhitespace();
            if (this.match('for')) {
                node.children.push(this.parseLoop('ForStatement'));
            } else if (this.match('while')) {
                node.children.push(this.parseLoop('WhileStatement'));
            } else if (this.match('{')) {
                node.children.push(this.parseBlock());
            } else {
                this.consume();
            }
        }
        this.consume();
        node.end = this.pos;
        return node;
    }
}

export class CppAnalyzer implements IStaticAnalyzer {
    async analyze(code: string): Promise<StaticAnalysisResult> {
        const parser = new CppParser(code);
        const ast = parser.parse();
        return this.analyzeAst(ast, code);
    }

    private analyzeAst(node: AstNode, code: string): StaticAnalysisResult {
        let maxDepth = 0;

        const traverse = (n: AstNode, depth: number) => {
            let d = depth;
            if (n.type === 'ForStatement' || n.type === 'WhileStatement') {
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
        if (code.match(/new\s+\w+\[.*[a-zA-Z].*\]/)) { // new int[n]
            spaceComplexity = 'O(n)';
        }
        if (code.match(/vector<.*>\s+\w+\(.*\)/)) { // vector<int> v(n)
            spaceComplexity = 'O(n)';
        }

        // --- Safety Checks ---
        const blockedPatterns = [
            'system(', 'fork(', 'exec(', 'socket(', 'connect(', 'bind(',
            '#include <fstream>', '#include <filesystem>', '#include <cstdlib>',
            'remove(', 'rename(', 'std::ifstream', 'std::ofstream'
        ];
        const warnings: string[] = [];
        let isSafe = true;

        blockedPatterns.forEach(pattern => {
            if (code.includes(pattern)) {
                isSafe = false;
                warnings.push(`Potentially dangerous pattern detected: ${pattern}`);
            }
        });

        return { timeComplexity, spaceComplexity, isSafe, warnings };
    }
}
