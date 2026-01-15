import { IStaticAnalyzer, StaticAnalysisResult } from '../interface';
import { HeuristicAnalyzer } from '../heuristic';

export class PythonAnalyzer implements IStaticAnalyzer {
    async analyze(code: string): Promise<StaticAnalysisResult> {
        // Python uses indentation, so our generic brace-counter heuristic needs tweaking or we just use regex detection for nesting.
        // For MVP, we'll check for nested indented 'for/while'.

        // Remove comments
        const cleanCode = code.replace(/#.*$/gm, '');

        let timeComplexity = 'O(1)';

        // Check for nested loops by indentation
        // Heuristic:
        // for ... :
        //    for ... : -> O(n^2)

        const lines = cleanCode.split('\n');
        let maxIndentedLoopDepth = 0;

        // Simple state machine for indentation
        // This is fragile but fast.

        const loopRegex = /^\s*(for|while)\b/;

        // Count max loop nesting based on indentation
        // We assume standard 4-space or tab indentation.

        // Simplified: "for ... :" followed later by lines with MORE indent + "for ... :"

        if (cleanCode.match(/for\s+.*:[\s\S]*?\n\s+for\s+.*:/)) {
            timeComplexity = 'O(n^2)';
        } else if (cleanCode.match(/(for|while)\s+/)) {
            timeComplexity = 'O(n)';
        }

        // Space
        let spaceComplexity = 'O(1)';
        if (code.includes(' = [0] * n') || code.includes(' = [0] * len(')) {
            spaceComplexity = 'O(n)';
        }

        return {
            timeComplexity,
            spaceComplexity
        };
    }
}
