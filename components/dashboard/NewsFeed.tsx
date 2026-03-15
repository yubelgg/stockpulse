"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper } from "lucide-react";
import type { HeadlineSentiment } from "@/types";

type NewsFeedProps = {
  headlines: HeadlineSentiment[];
  loading: boolean;
};

const sentimentBadge = {
  positive: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30",
  negative: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
  neutral: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
};

export default function NewsFeed({ headlines, loading }: NewsFeedProps) {
  if (loading) {
    return (
      <Card className="bg-white dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle className="text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-blue-400" />
            News Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full" />
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (headlines.length === 0) return null;

  return (
    <Card className="bg-white dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 h-full flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle className="text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-blue-400" />
          News Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-4">
        {headlines.slice(0, 5).map((item, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-700 last:border-0 last:pb-0"
          >
            <div className="flex-1">
              <p className="text-sm text-neutral-600 dark:text-gray-300 leading-relaxed">
                {item.headline}
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                {new Date(item.datetime * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <Badge className={`${sentimentBadge[item.label]} text-xs shrink-0`}>
              {item.label} ({(item.score * 100).toFixed(0)}%)
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
