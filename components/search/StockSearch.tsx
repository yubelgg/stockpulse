"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import type { SymbolSearchResult } from "@/types";

type DropdownPosition = {
  top: number;
  left: number;
  width: number;
};

export default function StockSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SymbolSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<DropdownPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showDropdown) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showDropdown, updatePosition]);

  function handleInputChange(value: string) {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length === 0) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
        const json = await res.json();
        if (json.data) {
          setResults(json.data);
          setShowDropdown(json.data.length > 0);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  }

  function handleSelect(symbol: string) {
    setShowDropdown(false);
    setQuery(symbol);
    router.push(`/dashboard/${symbol}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && query.trim()) {
      setShowDropdown(false);
      router.push(`/dashboard/${query.trim().toUpperCase()}`);
    }
    if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }

  const dropdown = showDropdown && dropdownPos && createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
        zIndex: 9999,
      }}
    >
      <Card className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 shadow-2xl">
        <CardContent className="p-2 max-h-[280px] overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.symbol}
              onClick={() => handleSelect(result.symbol)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-left"
            >
              <div>
                <span className="text-neutral-900 dark:text-neutral-100 font-semibold">{result.symbol}</span>
                <span className="text-neutral-500 dark:text-gray-400 text-sm ml-3">{result.description}</span>
              </div>
              <Badge variant="outline" className="text-neutral-500 dark:text-gray-400 border-neutral-300 dark:border-neutral-600 text-xs">
                {result.type}
              </Badge>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>,
    document.body
  );

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 dark:text-gray-400" />
        <Input
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder="Search by ticker or company name..."
          className="pl-12 pr-12 py-6 text-lg bg-neutral-100 dark:bg-neutral-800/80 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-gray-400 rounded-xl"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 dark:text-gray-400 animate-spin" />
        )}
      </div>
      {dropdown}
    </div>
  );
}
