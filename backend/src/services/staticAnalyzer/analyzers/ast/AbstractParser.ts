export interface AstNode {
    type: string;
    children: AstNode[];
    start: number;
    end: number;
    content?: string;
}

export abstract class AbstractParser {
    protected code: string;
    protected pos: number = 0;

    constructor(code: string) {
        this.code = code;
    }

    abstract parse(): AstNode;

    protected peek(): string {
        return this.code[this.pos] || '';
    }

    protected consume(): string {
        return this.code[this.pos++] || '';
    }

    protected match(str: string): boolean {
        return this.code.substr(this.pos, str.length) === str;
    }

    protected consumeWhile(predicate: (char: string) => boolean): string {
        let result = '';
        while (this.pos < this.code.length && predicate(this.peek())) {
            result += this.consume();
        }
        return result;
    }

    protected skipWhitespace(): void {
        this.consumeWhile(c => /\s/.test(c));
    }
}
