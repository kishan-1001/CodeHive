export interface StaticAnalysisResult {
    timeComplexity: string;
    spaceComplexity: string;
    isSafe: boolean;
    warnings: string[];
}

export interface IStaticAnalyzer {
    analyze(code: string): Promise<StaticAnalysisResult>;
}
