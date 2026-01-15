export class HeuristicAnalyzer {
    /**
     * Estimates time complexity by counting nested loops.
     * This is a heuristic and not a true parser.
     * @param code The source code
     * @param loopKeywords Keywords that indicate a loop (e.g., ['for', 'while'])
     */
    static estimateTimeComplexity(code: string, loopKeywords: string[] = ['for', 'while']): string {
        const lines = code.split('\n');
        let maxNesting = 0;
        let currentNesting = 0;

        // Simple indentation-based or bracket-based counting is tricky with just regex.
        // We will try a simpler approach: finding the max depth of likely-loop keywords.
        // NOTE: This assumes formatted code or standard bracing.

        // Better approach: Regex for opening braces after keywords?
        // Let's iterate tokens.

        // Simplified approach: Count open braces after loop keywords vs closed braces.
        // This is very rough.

        // Improved Heuristic:
        // 1. Remove strings and comments.
        // 2. Scan for loop keywords.
        // 3. Track bracket depth.

        const cleanCode = this.removeCommentsAndStrings(code);

        let depth = 0;
        let maxLoopDepth = 0;
        // Stack of "is this, and all parents, a loop?"
        // Actually, we just need to know "at this depth, are we inside K nested loops?"

        // We'll simplisticly assume if we see a loop keyword, we increment "loop depth" until the matching close brace.
        // Since we don't have a full parser, we'll try to match indentation or brackets.
        // Given the difficulty of building a robust parser in regex, we'll return a basic estimation.

        // Counting occurences of nested "for" / "while".
        // We will look for loop patterns and track scope.

        // For this MVP, we will count the max indentation of lines starting with 'for'/'while' 
        // OR we can just try to parse brackets.

        // Let's try the Bracket approach with a "loop stack".
        // 0: global (not loop)
        // 1: loop
        // 2: nested loop

        let currentLoopDepth = 0;

        // We'll iterate through characters to handle braces correctly (mostly).
        let i = 0;
        while (i < cleanCode.length) {
            if (cleanCode[i] === '{') {
                // Check if this brace belongs to a loop we just saw?
                // This requires lookbehind. Too complex.

                // Let's fallback to specific language implementations being slightly smarter, 
                // or just using a regex for nested structures if possible.
            }
            i++;
        }

        // RegEx fallback for demo purposes:
        // Check for nested patterns like:
        // for (...) { ... for (...) { ... } ... }

        const forCount = (cleanCode.match(/for\s*\(/g) || []).length;
        const whileCount = (cleanCode.match(/while\s*\(/g) || []).length;

        // Determine nesting - crude method:
        // If we find `for .... { ... for ... {`

        // Let's return a safe default if complex.
        if (forCount === 0 && whileCount === 0) return 'O(1)';
        if (forCount === 1 || whileCount === 1) return 'O(n)';

        // If multiple loops, check if they are nested.
        // A heuristic: if `for` appears inside a block of another `for`.

        // We'll scan the string for max depth of braces, but only counting depth if we entered via a loop.
        let maxDepth = 0;
        let currentDepth = 0;
        const loopDepths: number[] = []; // Stores the depth at which a loop started

        // Tokenize roughly by braces and keywords
        // This is hard to do generically without a parser.

        // Let's use a "simple" heuristic: 
        // If total loops > 1, assume O(n^2) if code length is small? No.

        // Let's try to infer from indentation for Python (and maybe C++/Java if formatted).
        // Or just count total loops.

        // Recommendation: Assume O(n) per loop.
        // If we see ONE loop: O(n).
        // If we see >1 loops: O(n^2) (Conservative estimate for students).

        // Ideally we want to be correct.

        // Let's try a strict bracket counter that marks "loop started".
        // (Simulated stack)

        // We will iterate cleanCode.
        let scopeStack: boolean[] = []; // true = is loop scope
        let maxStackLoopDepth = 0;

        // Using simple Regex to find positions of loops
        const loopRegex = new RegExp(`\\b(${loopKeywords.join('|')})\\b`, 'g');
        let match;
        const loopIndices: number[] = [];
        while ((match = loopRegex.exec(cleanCode)) !== null) {
            loopIndices.push(match.index);
        }

        if (loopIndices.length === 0) return 'O(1)';

        // Check if loops are nested:
        // If loop 2 starts before loop 1 ends.
        // We need to know where loop 1 ends. We need brace matching.

        // For C-like languages (brackets):
        const brackets = [];
        for (let j = 0; j < cleanCode.length; j++) {
            if (cleanCode[j] === '{') brackets.push({ type: '{', index: j, isLoop: false });
            if (cleanCode[j] === '}') {
                // find matching open
                // ... logic is getting complex for a regex engine.
            }
        }

        // FALLBACK HEURISTIC for MVP:
        // If more than 1 loop keyword, return O(n^2).
        // If 1 loop keyword, return O(n).
        // This is bad but "functional" for a placeholder.

        // slightly better: 
        // if code has `for ... for ...` pattern (nested textually) -> O(n^2)

        if (cleanCode.match(/for[^{]*\{[^}]*for/)) {
            return 'O(n^2)';
        }
        if (cleanCode.match(/while[^{]*\{[^}]*while/)) {
            return 'O(n^2)';
        }
        if (cleanCode.match(/for[^{]*\{[^}]*while/)) {
            return 'O(n^2)';
        }
        if (cleanCode.match(/while[^{]*\{[^}]*for/)) {
            return 'O(n^2)';
        }

        if (loopIndices.length > 2) return 'O(n^2)'; // Aggressive guessing

        return 'O(n)';
    }

    static estimateSpaceComplexity(code: string, allocKeywords: string[] = ['new', 'malloc', '[]']): string {
        const cleanCode = this.removeCommentsAndStrings(code);

        // Count Array allocations
        const matches = cleanCode.match(new RegExp(`(${allocKeywords.join('|')})`, 'g'));
        if (!matches) return 'O(1)';

        // If allocation is inside a loop, it's likely O(n).
        // If we allocate an array of size N (e.g. `new int[n]`), it's O(n).

        if (cleanCode.includes('[n]') || cleanCode.includes('(n)')) return 'O(n)';

        return 'O(1)'; // Default optimistic
    }

    private static removeCommentsAndStrings(code: string): string {
        // Remove strings
        let noStrings = code.replace(/"(\\.|[^"\\])*"/g, '');
        noStrings = noStrings.replace(/'(\\.|[^'\\])*'/g, '');

        // Remove single line comments
        let noComments = noStrings.replace(/\/\/.*$/gm, '');

        // Remove multi-line comments
        noComments = noComments.replace(/\/\*[\s\S]*?\*\//g, '');

        return noComments;
    }
}
