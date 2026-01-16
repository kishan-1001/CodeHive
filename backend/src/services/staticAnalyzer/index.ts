import { IStaticAnalyzer, StaticAnalysisResult } from './analyzers/interface';
import { PythonAnalyzer } from './analyzers/python/PythonParser';
import { AcornAnalyzer } from './analyzers/javascript/AcornAnalyzer';
import { CppAnalyzer } from './analyzers/cpp/CppParser';
import { JavaAnalyzer } from './analyzers/java/JavaParser';

export class StaticAnalyzerService {
    private static analyzers: Record<string, IStaticAnalyzer> = {
        python: new PythonAnalyzer(),
        javascript: new AcornAnalyzer(),
        c: new CppAnalyzer(),
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
