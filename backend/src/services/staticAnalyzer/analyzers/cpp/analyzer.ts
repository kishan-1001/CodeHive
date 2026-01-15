import { IStaticAnalyzer, StaticAnalysisResult } from '../interface';
import { HeuristicAnalyzer } from '../heuristic';

export class CppAnalyzer implements IStaticAnalyzer {
    async analyze(code: string): Promise<StaticAnalysisResult> {
        const timeComplexity = HeuristicAnalyzer.estimateTimeComplexity(code);
        // C++ vectors, arrays
        // new int[n]
        // vector<int> v(n)
        let spaceComplexity = 'O(1)';
        if (code.match(/new\s+\w+\[.*n.*\]/) || code.match(/vector<\w+>.*\((.*n.*)\)/)) {
            spaceComplexity = 'O(n)';
        }

        return {
            timeComplexity,
            spaceComplexity
        };
    }
}
