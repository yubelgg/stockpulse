import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Brain, LineChart, Newspaper } from 'lucide-react';
import Navigation from './components/Navigation';
import StockSearch from '@/components/search/StockSearch';

export default function Home() {
    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <Navigation />

            {/* Hero */}
            <section className="px-6 py-24">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                        StockPulse
                    </h1>
                    <p className="text-lg text-neutral-500 dark:text-gray-400 mb-10 max-w-xl mx-auto">
                        Search any stock to see recent news sentiment and price history.
                    </p>
                    <StockSearch />
                </div>
            </section>

            <Separator className="bg-neutral-200 dark:bg-neutral-800 max-w-4xl mx-auto" />

            {/* Features */}
            <section className="px-6 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="bg-white dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
                            <CardHeader>
                                <Brain className="h-6 w-6 text-blue-400 mb-3" />
                                <CardTitle className="text-neutral-900 dark:text-neutral-100 text-lg">Sentiment Analysis</CardTitle>
                                <CardDescription className="text-neutral-500 dark:text-gray-400">
                                    Recent headlines scored by sentiment so you can gauge market mood at a glance.
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="bg-white dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
                            <CardHeader>
                                <LineChart className="h-6 w-6 text-blue-400 mb-3" />
                                <CardTitle className="text-neutral-900 dark:text-neutral-100 text-lg">Price Charts</CardTitle>
                                <CardDescription className="text-neutral-500 dark:text-gray-400">
                                    Interactive price history with sentiment overlaid so you can spot patterns.
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="bg-white dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
                            <CardHeader>
                                <Newspaper className="h-6 w-6 text-blue-400 mb-3" />
                                <CardTitle className="text-neutral-900 dark:text-neutral-100 text-lg">News Feed</CardTitle>
                                <CardDescription className="text-neutral-500 dark:text-gray-400">
                                    Latest headlines with per-article sentiment tags and confidence scores.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-neutral-200 dark:border-neutral-800">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            <span className="text-neutral-900 dark:text-neutral-100 font-semibold text-sm">StockPulse</span>
                        </div>
                        <p className="text-neutral-400 dark:text-gray-500 text-sm">
                            &copy; 2026 StockPulse
                        </p>
                    </div>
                </div>
            </footer>
        </main>
    );
}
