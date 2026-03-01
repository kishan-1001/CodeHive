import { AbstractParser, AstNode } from '../ast/AbstractParser';
import { IStaticAnalyzer, StaticAnalysisResult } from '../interface';

export class JavaParser extends AbstractParser {
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
        this.consumeWhile(c => c !== '{' && c !== ';');

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

export class JavaAnalyzer implements IStaticAnalyzer {
    async analyze(code: string): Promise<StaticAnalysisResult> {
        const parser = new JavaParser(code);
        const ast = parser.parse();

        return this.analyzeAst(ast, code);
    }

    private analyzeAst(node: AstNode, code: string): StaticAnalysisResult {
        let maxDepth = 0;
        const warnings: string[] = [];
        let isSafe = true;

        const traverse = (n: AstNode, depth: number) => {
            let d = depth;
            if (n.type === 'ForStatement' || n.type === 'WhileStatement') {
                d++;
                maxDepth = Math.max(maxDepth, d);
            }
            n.children.forEach(c => traverse(c, d));
        };
        traverse(node, 0);

        // --- Hardened Safety Checks ---

        const blockedPackages = [
            'java\\.io', 'java\\.nio', 'java\\.net', 'java\\.sql', 'java\\.rmi', 'java\\.lang\\.reflect',
            'java\\.lang\\.management', 'javax\\.net', 'javax\\.crypto', 'java\\.security'
        ];

        for (const pkg of blockedPackages) {
            const regex = new RegExp(`import\\s+${pkg}`, 'i');
            if (regex.test(code)) {
                isSafe = false;
                warnings.push(`Security Violation: Blocked package import detected: ${pkg.replace(/\\/g, '')}`);
            }
        }

        const blockedApis = [
            'System\\.exit', 'Runtime\\.getRuntime', 'ProcessBuilder',
            'ClassLoader', 'Method\\.invoke', 'Field\\.set', 'Constructor\\.newInstance',
            'Socket', 'ServerSocket', 'DatagramSocket', 'URL', 'HttpURLConnection',
            'FileOutputStream', 'FileInputStream', 'FileChannel', 'Path', 'Files\\.'
        ];

        for (const api of blockedApis) {
            const regex = new RegExp(`\\b${api}\\b`, 'g');
            if (regex.test(code)) {
                isSafe = false;
                warnings.push(`Security Violation: Use of blocked API component: ${api.replace(/\\/g, '')}`);
            }
        }

        if (code.match(/\bnative\b/)) {
            isSafe = false;
            warnings.push('Security Violation: Native method declaration detected.');
        }

        // Complexity Estimation
        let timeComplexity = 'O(1)';
        if (maxDepth === 1) timeComplexity = 'O(n)';
        else if (maxDepth === 2) timeComplexity = 'O(n^2)';
        else if (maxDepth >= 3) timeComplexity = `O(n^${maxDepth})`;

        let spaceComplexity = 'O(1)';
        if (code.match(/new\s+\w+\[.*[a-zA-Z].*\]/)) spaceComplexity = 'O(n)';
        if (code.match(/ArrayList.*\(/) || code.match(/HashMap.*\(/)) spaceComplexity = 'O(n)';

        return { timeComplexity, spaceComplexity, isSafe, warnings };
    }
}
