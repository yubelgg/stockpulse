// Stock price candle data from Finnhub /stock/candle
export type StockPrice = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

// Current quote from Finnhub /quote
export type StockQuote = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  previousClose: number;
};

// News article from Finnhub /company-news
export type NewsArticle = {
  headline: string;
  summary: string;
  source: string;
  datetime: number;
  url: string;
};

// Sentiment result per headline from Gemini
export type HeadlineSentiment = {
  label: "positive" | "negative" | "neutral";
  score: number;
  headline: string;
  datetime: number; // Unix timestamp (seconds) from Finnhub
};

// Overall sentiment for a ticker
export type TickerSentiment = {
  overall: "positive" | "negative" | "neutral";
  averageScore: number;
  headlines: HeadlineSentiment[];
};

// Earnings data from Finnhub /stock/earnings
export type EarningsResult = {
  actual: number | null;
  estimate: number | null;
  period: string; // "YYYY-MM-DD"
  surprise: number | null;
  surprisePercent: number | null;
  symbol: string;
};

// Finnhub symbol search result
export type SymbolSearchResult = {
  symbol: string;
  description: string;
  type: string;
};

// API route response shapes
export type ApiSuccess<T> = { data: T };
export type ApiError = { error: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
