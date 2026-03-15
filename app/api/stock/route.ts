import { NextRequest, NextResponse } from "next/server";
import { fetchStockCandles, fetchQuote, fetchEarnings } from "@/lib/finnhub";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const days = parseInt(searchParams.get("days") ?? "30", 10);

  if (!symbol) {
    return NextResponse.json({ error: "symbol parameter is required" }, { status: 400 });
  }

  if (isNaN(days) || days < 1 || days > 365) {
    return NextResponse.json({ error: "days must be between 1 and 365" }, { status: 400 });
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const from = now - days * 24 * 60 * 60;

    const [prices, quote, earnings] = await Promise.all([
      fetchStockCandles(symbol, from, now),
      fetchQuote(symbol),
      fetchEarnings(symbol),
    ]);

    return NextResponse.json({ data: { prices, quote, earnings } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch stock data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
