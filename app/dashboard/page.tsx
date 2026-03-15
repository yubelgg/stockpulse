import Navigation from "../components/Navigation";
import StockSearch from "@/components/search/StockSearch";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Navigation />
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Search a Stock
        </h1>
        <p className="text-neutral-500 dark:text-gray-400 text-lg mb-8">
          Enter a ticker symbol or company name to view AI-powered sentiment analysis
        </p>
        <StockSearch />
      </div>
    </div>
  );
}
