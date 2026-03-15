'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { TrendingUp, Home, BarChart3, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function Navigation() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    return (
        <nav className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <TrendingUp className="h-7 w-7 text-blue-500" />
                        <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">StockPulse</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link href="/">
                            <Button
                                variant={pathname === '/' ? 'default' : 'ghost'}
                                size="sm"
                                className={cn(
                                    "text-neutral-600 dark:text-gray-300 hover:text-neutral-900 dark:hover:text-white",
                                    pathname === '/' && "bg-blue-600 text-white hover:bg-blue-700"
                                )}
                            >
                                <Home className="mr-2 h-4 w-4" />
                                Home
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button
                                variant={pathname.startsWith('/dashboard') ? 'default' : 'ghost'}
                                size="sm"
                                className={cn(
                                    "text-neutral-600 dark:text-gray-300 hover:text-neutral-900 dark:hover:text-white",
                                    pathname.startsWith('/dashboard') && "bg-blue-600 text-white hover:bg-blue-700"
                                )}
                            >
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Dashboard
                            </Button>
                        </Link>
                        {mounted && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="text-neutral-600 dark:text-gray-300 hover:text-neutral-900 dark:hover:text-white"
                            >
                                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
