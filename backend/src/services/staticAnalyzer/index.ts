import { IStaticAnalyzer, StaticAnalysisResult } from './analyzers/interface';
import { PythonAnalyzer } from './analyzers/python/analyzer';
import { JavaScriptAnalyzer } from './analyzers/javascript/analyzer';
import { CppAnalyzer } from './analyzers/cpp/analyzer';
import { JavaAnalyzer } from './analyzers/java/analyzer';

export class StaticAnalyzerService {
    private static analyzers: Record<string, IStaticAnalyzer> = {
        python: new PythonAnalyzer(),
        javascript: new JavaScriptAnalyzer(),
        c: new CppAnalyzer(), // C and C++ share similar structure for this simple heuristic
        cpp: new CppAnalyzer(),
        java: new JavaAnalyzer(),
    };

    static async analyze(code: string, language: string): Promise<StaticAnalysisResult> {
        const analyzer = this.analyzers[language.toLowerCase()];
        if (!analyzer) {
            // Default fallback or error
            return { timeComplexity: 'Unknown', spaceComplexity: 'Unknown' };
        }
        return analyzer.analyze(code);
    }
}
