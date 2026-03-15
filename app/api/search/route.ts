import { NextRequest, NextResponse } from "next/server";
import { searchSymbols } from "@/lib/finnhub";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: "q parameter is required" }, { status: 400 });
  }

  try {
    const results = await searchSymbols(query);
    return NextResponse.json({ data: results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to search symbols";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
