"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Brain, Minus } from "lucide-react";
import type { StockQuote, TickerSentiment } from "@/types";

type StockHeaderProps = {
  quote: StockQuote | null;
  sentiment: TickerSentiment | null;
  loading: boolean;
  sentimentLoading: boolean;
};

const sentimentConfig = {
  positive: {
    badgeClass: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30",
    icon: TrendingUp,
  },
  negative: {
    badgeClass: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
    icon: TrendingDown,
  },
  neutral: {
    badgeClass: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
    icon: Minus,
  },
};

export default function StockHeader({ quote, sentiment, loading, sentimentLoading }: StockHeaderProps) {
  if (loading) {
    return (
      <Card className="bg-white dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 py-2 gap-0">
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-8 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
            <div className="h-10 w-48 bg-neutral-200 dark:bg-neutral-700 rounded" />
            <div className="h-4 w-40 bg-neutral-200 dark:bg-neutral-700 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quote) return null;

  const isPositive = quote.change >= 0;

  return (
    <Card className="bg-white dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 py-2 gap-0">
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: Stock Info */}
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{quote.symbol}</h1>
              <span className="text-neutral-500 dark:text-gray-400 text-lg">{quote.name}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                ${quote.price.toFixed(2)}
              </span>
              <Badge
                className={`${
                  isPositive
                    ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30"
                    : "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30"
                } flex items-center gap-1 px-3 py-1`}
              >
                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {isPositive ? "+" : ""}{quote.change.toFixed(2)} ({isPositive ? "+" : ""}{quote.changePercent.toFixed(2)}%)
              </Badge>
            </div>

            <div className="flex gap-5 text-sm text-neutral-500 dark:text-gray-400">
              <span>High: ${quote.high.toFixed(2)}</span>
              <span>Low: ${quote.low.toFixed(2)}</span>
              <span>Prev Close: ${quote.previousClose.toFixed(2)}</span>
            </div>
          </div>

          {/* Right: Sentiment */}
          <div className="lg:border-l lg:border-neutral-200 dark:lg:border-neutral-700 lg:pl-6 space-y-2 lg:w-56">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">AI Sentiment</span>
            </div>

            {sentimentLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-8 w-28 bg-neutral-200 dark:bg-neutral-700 rounded" />
                <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded" />
                <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
              </div>
            ) : sentiment ? (
              <>
                <Badge className={`${sentimentConfig[sentiment.overall].badgeClass} px-4 py-1.5 text-base font-bold flex items-center gap-1.5 w-fit`}>
                  {(() => {
                    const Icon = sentimentConfig[sentiment.overall].icon;
                    return <Icon className="h-4 w-4" />;
                  })()}
                  {sentiment.overall.toUpperCase()}
                </Badge>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-neutral-500 dark:text-gray-400">
                    <span>Confidence</span>
                    <span>{(sentiment.averageScore * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={sentiment.averageScore * 100} className="h-1.5" />
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="text-neutral-600 dark:text-gray-300">{sentiment.headlines.filter(h => h.label === "positive").length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span className="text-neutral-600 dark:text-gray-300">{sentiment.headlines.filter(h => h.label === "neutral").length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-neutral-600 dark:text-gray-300">{sentiment.headlines.filter(h => h.label === "negative").length}</span>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
