import type {
  StockPrice,
  StockQuote,
  SymbolSearchResult,
  NewsArticle,
  EarningsResult,
} from "@/types";

const BASE_URL = "https://finnhub.io/api/v1";

function getApiKey(): string {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) {
    throw new Error("FINNHUB_API_KEY is not configured");
  }
  return key;
}

async function finnhubFetch<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("token", getApiKey());
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

// Yahoo Finance chart API for historical prices (Finnhub candles require premium)
type YahooChartResponse = {
  chart: {
    result: Array<{
      timestamp: number[];
      indicators: {
        quote: Array<{
          open: number[];
          high: number[];
          low: number[];
          close: number[];
          volume: number[];
        }>;
      };
    }>;
    error: { code: string; description: string } | null;
  };
};

export async function fetchStockCandles(
  symbol: string,
  _fromTimestamp: number,
  _toTimestamp: number
): Promise<StockPrice[]> {
  const daysDiff = Math.round((_toTimestamp - _fromTimestamp) / (24 * 60 * 60));
  const range = daysDiff > 90 ? "6mo" : daysDiff > 30 ? "3mo" : "1mo";

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol.toUpperCase())}?range=${range}&interval=1d`;

  const response = await fetch(url, {
    headers: { "User-Agent": "StockPulse/1.0" },
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
  }

  const data: YahooChartResponse = await response.json();

  if (data.chart.error) {
    throw new Error(`No price data found for ${symbol}: ${data.chart.error.description}`);
  }

  const result = data.chart.result[0];
  const quote = result.indicators.quote[0];

  return result.timestamp
    .map((ts, i) => ({
      date: new Date(ts * 1000).toISOString().split("T")[0],
      open: quote.open[i],
      high: quote.high[i],
      low: quote.low[i],
      close: quote.close[i],
      volume: quote.volume[i],
    }))
    .filter((d) => d.close !== null);
}

// Finnhub /quote response shape
type QuoteResponse = {
  c: number;  // current price
  d: number;  // change
  dp: number; // percent change
  h: number;  // high
  l: number;  // low
  o: number;  // open
  pc: number; // previous close
};

export async function fetchQuote(symbol: string): Promise<StockQuote> {
  const data = await finnhubFetch<QuoteResponse>("/quote", {
    symbol: symbol.toUpperCase(),
  });

  if (data.c === 0) {
    throw new Error(`No quote data found for ${symbol}`);
  }

  return {
    symbol: symbol.toUpperCase(),
    name: symbol.toUpperCase(),
    price: data.c,
    change: data.d,
    changePercent: data.dp,
    high: data.h,
    low: data.l,
    previousClose: data.pc,
  };
}

// Finnhub /search response shape
type SearchResponse = {
  count: number;
  result: Array<{
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
  }>;
};

export async function searchSymbols(query: string): Promise<SymbolSearchResult[]> {
  const data = await finnhubFetch<SearchResponse>("/search", {
    q: query,
  });

  const seen = new Set<string>();
  return data.result
    .filter((r) => {
      if (r.type !== "Common Stock" || seen.has(r.symbol)) return false;
      seen.add(r.symbol);
      return true;
    })
    .slice(0, 10)
    .map((r) => ({
      symbol: r.symbol,
      description: r.description,
      type: r.type,
    }));
}

// Finnhub /stock/earnings response shape
type EarningsItem = {
  actual: number | null;
  estimate: number | null;
  period: string;
  quarter: number;
  surprise: number | null;
  surprisePercent: number | null;
  symbol: string;
  year: number;
};

export async function fetchEarnings(symbol: string): Promise<EarningsResult[]> {
  const data = await finnhubFetch<EarningsItem[]>("/stock/earnings", {
    symbol: symbol.toUpperCase(),
    limit: "4",
  });

  return data.map((item) => ({
    actual: item.actual,
    estimate: item.estimate,
    period: item.period,
    surprise: item.surprise,
    surprisePercent: item.surprisePercent,
    symbol: item.symbol,
  }));
}

// Finnhub /company-news response shape
type CompanyNewsItem = {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
};

export async function fetchCompanyNews(
  symbol: string,
  fromDate: string,
  toDate: string
): Promise<NewsArticle[]> {
  const data = await finnhubFetch<CompanyNewsItem[]>("/company-news", {
    symbol: symbol.toUpperCase(),
    from: fromDate,
    to: toDate,
  });

  return data.slice(0, 10).map((item) => ({
    headline: item.headline,
    summary: item.summary,
    source: item.source,
    datetime: item.datetime,
    url: item.url,
  }));
}
