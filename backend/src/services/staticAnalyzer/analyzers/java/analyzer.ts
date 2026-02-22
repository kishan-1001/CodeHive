import { IStaticAnalyzer, StaticAnalysisResult } from '../interface';
import { HeuristicAnalyzer } from '../heuristic';

export class JavaAnalyzer implements IStaticAnalyzer {
    async analyze(code: string): Promise<StaticAnalysisResult> {
        const timeComplexity = HeuristicAnalyzer.estimateTimeComplexity(code);
        // new int[n]
        let spaceComplexity = 'O(1)';
        if (code.match(/new\s+\w+\[.*n.*\]/)) {
            spaceComplexity = 'O(n)';
        }

        return {
            timeComplexity,
            spaceComplexity,
            isSafe: true,
            warnings: []
        };
    }
}
