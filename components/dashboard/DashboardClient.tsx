"use client";

import { useState, useEffect } from "react";
import StockSearch from "@/components/search/StockSearch";
import StockHeader from "./StockHeader";
import NewsFeed from "./NewsFeed";
import PriceChart from "./PriceChart";
import type { StockQuote, StockPrice, TickerSentiment, EarningsResult } from "@/types";

type DashboardClientProps = {
  ticker: string;
};

export default function DashboardClient({ ticker }: DashboardClientProps) {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [prices, setPrices] = useState<StockPrice[]>([]);
  const [earnings, setEarnings] = useState<EarningsResult[]>([]);
  const [sentiment, setSentiment] = useState<TickerSentiment | null>(null);
  const [stockLoading, setStockLoading] = useState(true);
  const [sentimentLoading, setSentimentLoading] = useState(true);
  const [stockError, setStockError] = useState<string | null>(null);
  const [sentimentError, setSentimentError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStockData() {
      setStockLoading(true);
      setStockError(null);
      try {
        const res = await fetch(`/api/stock?symbol=${encodeURIComponent(ticker)}&days=90`);
        const json = await res.json();
        if (json.error) {
          setStockError(json.error);
        } else {
          setQuote(json.data.quote);
          setPrices(json.data.prices);
          setEarnings(json.data.earnings);
        }
      } catch {
        setStockError("Failed to fetch stock data");
      } finally {
        setStockLoading(false);
      }
    }

    async function fetchSentimentData() {
      setSentimentLoading(true);
      setSentimentError(null);
      try {
        const res = await fetch(`/api/sentiment?symbol=${encodeURIComponent(ticker)}`);
        const json = await res.json();
        if (json.error) {
          setSentimentError(json.error);
        } else {
          setSentiment(json.data);
        }
      } catch {
        setSentimentError("Failed to analyze sentiment");
      } finally {
        setSentimentLoading(false);
      }
    }

    fetchStockData();
    fetchSentimentData();
  }, [ticker]);

  return (
    <div className="space-y-4">
      <div className="max-w-sm">
        <StockSearch />
      </div>
      <StockHeader quote={quote} sentiment={sentiment} loading={stockLoading} sentimentLoading={sentimentLoading} />

      {stockError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-600 dark:text-red-400 text-sm">
          {stockError}
        </div>
      )}

      {sentimentError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-600 dark:text-red-400 text-sm">
          {sentimentError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PriceChart
            prices={prices}
            earnings={earnings}
            loading={stockLoading}
          />
        </div>

        <div className="lg:relative">
          <div className="lg:absolute lg:inset-0">
            <NewsFeed
              headlines={sentiment?.headlines ?? []}
              loading={sentimentLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
