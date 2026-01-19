
// Using verified working model for this key
const MODEL = "gemini-flash-latest";

export interface FeedbackResponse {
    correctness: {
        passedCases: string[];
        failedCases: string[];
        userOutput: string;
        expectedOutput: string;
    };
    complexity: {
        time: string;
        space: string;
        optimalTime: string;
        optimalSpace: string;
    };
    approach: {
        type: string; // e.g., "Brute Force", "Two Pointers"
        suggested: string;
    };
    quality: {
        naming: string;
        comments: string;
        structure: string;
    };
    bestPractices: string[];
    edgeCases: string[];
    optimization: string[];
    security: string[];
    scores: {
        correctness: number;
        efficiency: number;
        codeQuality: number;
        edgeCases: number;
        overall: number;
    };
}

// Helper to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const aiService = {
    async getCodeFeedback(code: string, language: string, problemTitle: string, problemDescription: string): Promise<FeedbackResponse> {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY is missing in process.env");
            return {
                correctness: { passedCases: [], failedCases: [], userOutput: "N/A", expectedOutput: "N/A" },
                complexity: { time: "Unknown", space: "Unknown", optimalTime: "Unknown", optimalSpace: "Unknown" },
                approach: { type: "Unknown", suggested: "Unknown" },
                quality: { naming: "N/A", comments: "N/A", structure: "N/A" },
                bestPractices: ["API Key missing"],
                edgeCases: [],
                optimization: [],
                security: [],
                scores: { correctness: 0, efficiency: 0, codeQuality: 0, edgeCases: 0, overall: 0 }
            };
        }

        const prompt = `
    You are an expert coding interviewer at a top tech company. Analyze the following ${language} solution for the problem "${problemTitle}".
    
    Problem Description:
    ${problemDescription.substring(0, 1000)}...

    User Code:
    \`\`\`${language}
    ${code}
    \`\`\`

    Provide a deep, structured analysis covering these 8 pillars. Return the response in this EXACT JSON format:
    {
      "correctness": {
        "passedCases": ["List 2-3 likely passed scenarios"],
        "failedCases": ["List 1-2 likely failed scenarios or 'None'"],
        "userOutput": "Example output for a failed case or 'Correct'",
        "expectedOutput": "Expected output for that case"
      },
      "complexity": {
        "time": "Estimated time complexity (e.g., O(n))",
        "space": "Estimated space complexity (e.g., O(1))",
        "optimalTime": "Optimal possible time complexity",
        "optimalSpace": "Optimal possible space complexity"
      },
      "approach": {
        "type": "Name of the approach used (e.g., Brute Force, DFS)",
        "suggested": "Better approach if applicable, or 'Current is optimal'"
      },
      "quality": {
        "naming": "Feedback on variable/function naming",
        "comments": "Feedback on code comments and docs",
        "structure": "Feedback on modularity and organization"
      },
      "bestPractices": ["List 2-3 language-specific best practices to follow"],
      "edgeCases": ["List 2-3 edge cases (e.g., empty input, max values) handled or missed"],
      "optimization": ["List 1-2 specific optimization tips"],
      "security": ["List any potential security/reliability issues (e.g., input validation)"],
      "scores": {
        "correctness": 0-10,
        "efficiency": 0-10,
        "codeQuality": 0-10,
        "edgeCases": 0-10,
        "overall": 0-10
      }
    }
    `;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

        // Retry Logic
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                attempts++;
                console.log(`[AI] Requesting feedback from Google Gemini (Attempt ${attempts} with ${MODEL})...`);

                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.2, // Low temperature for consistent JSON
                            responseMimeType: "application/json"
                        }
                    })
                });

                if (response.status === 429) {
                    console.warn(`[AI] Rate limit hit (429). Waiting longer before retry...`);
                    // Exponential backoff: 4s, 8s, 16s
                    await wait(4000 * Math.pow(2, attempts - 1));
                    continue;
                }

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errText}`);
                }

                const result: any = await response.json();
                const candidates = result.candidates;

                if (!candidates || candidates.length === 0) throw new Error("No candidates returned");

                const generatedText = candidates[0].content.parts[0].text;
                if (!generatedText) throw new Error("No text generated");

                console.log(`[AI] Success! Response length: ${generatedText.length}`);

                let cleanedText = generatedText;
                try {
                    cleanedText = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
                    return JSON.parse(cleanedText);
                } catch (e) {
                    console.error("[AI] Failed to parse JSON:", generatedText);
                    throw new Error("JSON Parse Error");
                }

            } catch (error: any) {
                console.error(`[AI] Attempt ${attempts} failed:`, error.message);
                if (attempts === maxAttempts) {
                    // Return a fallback error object instead of crashing
                    return {
                        correctness: { passedCases: [], failedCases: ["Analysis Failed"], userOutput: "Error", expectedOutput: "Error" },
                        complexity: { time: "Unknown", space: "Unknown", optimalTime: "Unknown", optimalSpace: "Unknown" },
                        approach: { type: "Unknown", suggested: "Unknown" },
                        quality: { naming: "Unknown", comments: "Unknown", structure: "Unknown" },
                        bestPractices: ["Service Unavailable"],
                        edgeCases: [],
                        optimization: [],
                        security: [],
                        scores: { correctness: 0, efficiency: 0, codeQuality: 0, edgeCases: 0, overall: 0 }
                    };
                }
            }
        }

        return {
            correctness: { passedCases: [], failedCases: ["Analysis Timeout"], userOutput: "Timeout", expectedOutput: "Timeout" },
            complexity: { time: "Unknown", space: "Unknown", optimalTime: "Unknown", optimalSpace: "Unknown" },
            approach: { type: "Unknown", suggested: "Unknown" },
            quality: { naming: "Unknown", comments: "Unknown", structure: "Unknown" },
            bestPractices: ["Service Busy"],
            edgeCases: [],
            optimization: [],
            security: [],
            scores: { correctness: 0, efficiency: 0, codeQuality: 0, edgeCases: 0, overall: 0 }
        };
    }
};
