export interface StaticAnalysisResult {
    timeComplexity: string;
    spaceComplexity: string;
}

export interface IStaticAnalyzer {
    analyze(code: string): Promise<StaticAnalysisResult>;
}
