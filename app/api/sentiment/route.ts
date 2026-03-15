import { NextRequest, NextResponse } from "next/server";
import { fetchCompanyNews } from "@/lib/finnhub";
import { analyzeHeadlines, calculateOverallSentiment } from "@/lib/sentiment";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "symbol parameter is required" }, { status: 400 });
  }

  try {
    // Fetch news from the last 7 days
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const toDate = now.toISOString().split("T")[0];
    const fromDate = weekAgo.toISOString().split("T")[0];

    const articles = await fetchCompanyNews(symbol, fromDate, toDate);

    if (articles.length === 0) {
      return NextResponse.json(
        { error: `No recent news found for ${symbol}` },
        { status: 404 }
      );
    }

    const headlineInputs = articles.map((a) => ({ headline: a.headline, datetime: a.datetime }));
    const sentimentResults = await analyzeHeadlines(headlineInputs);
    const overall = calculateOverallSentiment(sentimentResults);

    return NextResponse.json({ data: overall });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to analyze sentiment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
