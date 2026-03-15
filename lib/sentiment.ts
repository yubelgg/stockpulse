import type { HeadlineSentiment, TickerSentiment } from "@/types";

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return key;
}

type GeminiResponse = {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
};

type GeminiSentimentResult = {
  results: Array<{
    label: "positive" | "negative" | "neutral";
    score: number;
    headline: string;
  }>;
};

type HeadlineInput = {
  headline: string;
  datetime: number;
};

export async function analyzeHeadlines(
  inputs: HeadlineInput[]
): Promise<HeadlineSentiment[]> {
  if (inputs.length === 0) {
    throw new Error("No headlines provided for sentiment analysis");
  }

  const headlines = inputs.map((i) => i.headline);

  const prompt = `Analyze the sentiment of each financial news headline below. For each headline, return a JSON object with:
- "label": one of "positive", "negative", or "neutral"
- "score": a confidence score between 0 and 1
- "headline": the original headline text

Return ONLY valid JSON in this exact format, no other text:
{"results": [{"label": "positive", "score": 0.85, "headline": "..."}]}

Headlines to analyze:
${headlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}`;

  const apiKey = getApiKey();
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data: GeminiResponse = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  const parsed: GeminiSentimentResult = JSON.parse(text);

  return parsed.results.map((r, i) => ({
    label: r.label,
    score: r.score,
    headline: r.headline,
    datetime: inputs[i].datetime,
  }));
}

export function calculateOverallSentiment(
  results: HeadlineSentiment[]
): TickerSentiment {
  if (results.length === 0) {
    return { overall: "neutral", averageScore: 0, headlines: [] };
  }

  const positiveCount = results.filter((r) => r.label === "positive").length;
  const negativeCount = results.filter((r) => r.label === "negative").length;

  let overall: "positive" | "negative" | "neutral";
  if (positiveCount > negativeCount) {
    overall = "positive";
  } else if (negativeCount > positiveCount) {
    overall = "negative";
  } else {
    overall = "neutral";
  }

  const averageScore =
    results.reduce((sum, r) => sum + r.score, 0) / results.length;

  return { overall, averageScore, headlines: results };
}
