import { IStaticAnalyzer, StaticAnalysisResult } from '../interface';
import { HeuristicAnalyzer } from '../heuristic';

export class JavaScriptAnalyzer implements IStaticAnalyzer {
    async analyze(code: string): Promise<StaticAnalysisResult> {
        const timeComplexity = HeuristicAnalyzer.estimateTimeComplexity(code);
        const spaceComplexity = HeuristicAnalyzer.estimateSpaceComplexity(code, ['new Array', '\\[.*\\]']);

        return {
            timeComplexity,
            spaceComplexity,
            isSafe: true,
            warnings: []
        };
    }
}
