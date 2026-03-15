"use client";

import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";
import type { StockPrice, EarningsResult } from "@/types";

type PriceChartProps = {
  prices: StockPrice[];
  earnings: EarningsResult[];
  loading: boolean;
};

const themeColors = {
  dark: {
    grid: "#404040",
    axisText: "#9ca3af",
    axisDomain: "#525252",
    tooltipBg: "#262626",
    tooltipBorder: "#525252",
    tooltipText: "#f5f5f5",
    earningsLine: "#a855f7",
    earningsTooltipBg: "#1e1e1e",
    earningsTooltipBorder: "#525252",
    earningsTooltipText: "#f5f5f5",
    earningsTooltipMuted: "#9ca3af",
    legendText: "#9ca3af",
  },
  light: {
    grid: "#e5e5e5",
    axisText: "#6b7280",
    axisDomain: "#d1d5db",
    tooltipBg: "#ffffff",
    tooltipBorder: "#d1d5db",
    tooltipText: "#171717",
    earningsLine: "#7c3aed",
    earningsTooltipBg: "#ffffff",
    earningsTooltipBorder: "#d1d5db",
    earningsTooltipText: "#171717",
    earningsTooltipMuted: "#6b7280",
    legendText: "#6b7280",
  },
};

export default function PriceChart({ prices, earnings, loading }: PriceChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [days, setDays] = useState<30 | 90>(30);
  const { resolvedTheme } = useTheme();

  const filteredPrices = prices.slice(-days);
  const colors = themeColors[resolvedTheme === "light" ? "light" : "dark"];

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || filteredPrices.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const containerWidth = containerRef.current.clientWidth;
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    svg.attr("width", containerWidth).attr("height", 300);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const parseDate = d3.timeParse("%Y-%m-%d");
    const data = filteredPrices.map((d) => ({
      date: parseDate(d.date) as Date,
      close: d.close,
    }));

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date) as [Date, Date])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([
        (d3.min(data, (d) => d.close) as number) * 0.98,
        (d3.max(data, (d) => d.close) as number) * 1.02,
      ])
      .range([height, 0]);

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).tickSize(-width).tickFormat(() => ""))
      .selectAll("line")
      .attr("stroke", colors.grid)
      .attr("stroke-dasharray", "2,2");
    g.selectAll(".grid .domain").remove();

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat((d) => d3.timeFormat("%b %d")(d as Date)))
      .selectAll("text")
      .attr("fill", colors.axisText)
      .attr("font-size", "12px");
    g.selectAll(".domain").attr("stroke", colors.axisDomain);
    g.selectAll("line").attr("stroke", colors.axisDomain);

    // Y axis left (price)
    g.append("g")
      .call(d3.axisLeft(y).ticks(6).tickFormat((d) => `$${d}`))
      .selectAll("text")
      .attr("fill", colors.axisText)
      .attr("font-size", "12px");

    // Gradient fill
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "price-gradient")
      .attr("x1", "0")
      .attr("x2", "0")
      .attr("y1", "0")
      .attr("y2", "1");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6").attr("stop-opacity", 0.3);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#3b82f6").attr("stop-opacity", 0);

    // Area
    const area = d3
      .area<{ date: Date; close: number }>()
      .x((d) => x(d.date))
      .y0(height)
      .y1((d) => y(d.close))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("fill", "url(#price-gradient)")
      .attr("d", area);

    // Price line
    const line = d3
      .line<{ date: Date; close: number }>()
      .x((d) => x(d.date))
      .y((d) => y(d.close))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Price tooltip (on line hover)
    const priceTooltip = g.append("g").style("display", "none");
    priceTooltip.append("circle").attr("r", 4).attr("fill", "#3b82f6").attr("stroke", "white").attr("stroke-width", 2);
    priceTooltip.append("rect").attr("x", -60).attr("y", -45).attr("width", 120).attr("height", 35).attr("rx", 6).attr("fill", colors.tooltipBg).attr("stroke", colors.tooltipBorder);
    const priceTooltipText = priceTooltip.append("text").attr("text-anchor", "middle").attr("y", -22).attr("fill", colors.tooltipText).attr("font-size", "12px");

    const bisect = d3.bisector<{ date: Date; close: number }, Date>((d) => d.date).left;

    svg.on("mousemove", (event) => {
      const [mx] = d3.pointer(event, g.node());
      const x0 = x.invert(mx);
      const i = bisect(data, x0, 1);
      const d0 = data[i - 1];
      const d1 = data[i];
      if (!d0 || !d1) return;
      const d = x0.getTime() - d0.date.getTime() > d1.date.getTime() - x0.getTime() ? d1 : d0;

      priceTooltip.style("display", null);
      priceTooltip.attr("transform", `translate(${x(d.date)},${y(d.close)})`);
      priceTooltipText.text(`$${d.close.toFixed(2)} · ${d3.timeFormat("%b %d")(d.date)}`);
    });

    svg.on("mouseleave", () => priceTooltip.style("display", "none"));

    // Earnings markers
    const [xMin, xMax] = x.domain();
    const earningsInRange = earnings
      .map((e) => ({ ...e, date: parseDate(e.period) as Date }))
      .filter((e) => e.date >= xMin && e.date <= xMax);

    if (earningsInRange.length > 0) {
      const earningsTooltip = d3.select(containerRef.current)
        .append("div")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("background", colors.earningsTooltipBg)
        .style("border", `1px solid ${colors.earningsTooltipBorder}`)
        .style("border-radius", "8px")
        .style("padding", "10px 14px")
        .style("font-size", "12px")
        .style("color", colors.earningsTooltipText)
        .style("max-width", "240px")
        .style("box-shadow", "0 4px 20px rgba(0,0,0,0.15)")
        .style("z-index", "100")
        .style("opacity", "0")
        .style("transition", "opacity 0.15s");

      earningsInRange.forEach((e) => {
        const ex = x(e.date);

        // Vertical dashed line
        g.append("line")
          .attr("x1", ex)
          .attr("x2", ex)
          .attr("y1", 0)
          .attr("y2", height)
          .attr("stroke", colors.earningsLine)
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", "6,4")
          .attr("opacity", 0.6);

        // "E" label at top
        const label = g.append("g")
          .attr("transform", `translate(${ex},${-6})`)
          .attr("cursor", "pointer");

        label.append("circle")
          .attr("r", 10)
          .attr("fill", colors.earningsLine)
          .attr("opacity", 0.9);

        label.append("text")
          .attr("text-anchor", "middle")
          .attr("y", 4)
          .attr("fill", "#ffffff")
          .attr("font-size", "11px")
          .attr("font-weight", "bold")
          .text("E");

        // Hover interactions
        label
          .on("mouseenter", (event) => {
            priceTooltip.style("display", "none");

            const surpriseColor = e.surprise !== null && e.surprise >= 0 ? "#22c55e" : "#ef4444";
            const surpriseSign = e.surprise !== null && e.surprise >= 0 ? "+" : "";

            earningsTooltip.html(
              `<div style="margin-bottom:6px;font-weight:600;color:${colors.earningsLine};font-size:11px;letter-spacing:0.5px">EARNINGS REPORT</div>` +
              `<div style="line-height:1.6">` +
              `<div>EPS Actual: <strong>${e.actual !== null ? `$${e.actual.toFixed(2)}` : "N/A"}</strong></div>` +
              `<div>EPS Estimate: <strong>${e.estimate !== null ? `$${e.estimate.toFixed(2)}` : "N/A"}</strong></div>` +
              (e.surprise !== null
                ? `<div>Surprise: <span style="color:${surpriseColor};font-weight:600">${surpriseSign}$${e.surprise.toFixed(2)} (${surpriseSign}${e.surprisePercent?.toFixed(1)}%)</span></div>`
                : "") +
              `</div>` +
              `<div style="margin-top:6px;color:${colors.earningsTooltipMuted};font-size:11px">${d3.timeFormat("%b %d, %Y")(e.date)}</div>`
            );

            const containerRect = containerRef.current!.getBoundingClientRect();
            const dotX = event.clientX - containerRect.left;
            const dotY = event.clientY - containerRect.top;
            const tooltipNode = earningsTooltip.node() as HTMLDivElement;
            const tooltipWidth = tooltipNode.offsetWidth || 240;

            let left = dotX + 12;
            if (left + tooltipWidth > containerWidth) {
              left = dotX - tooltipWidth - 12;
            }

            earningsTooltip
              .style("left", `${left}px`)
              .style("top", `${dotY - 10}px`)
              .style("opacity", "1");
          })
          .on("mouseleave", () => {
            earningsTooltip.style("opacity", "0");
          });
      });

      // Legend
      const legend = g.append("g").attr("transform", `translate(${width - 160}, -5)`);
      legend.append("line").attr("x1", 0).attr("x2", 20).attr("y1", 0).attr("y2", 0).attr("stroke", "#3b82f6").attr("stroke-width", 2);
      legend.append("text").attr("x", 25).attr("y", 4).attr("fill", colors.legendText).attr("font-size", "11px").text("Price");
      legend.append("line").attr("x1", 75).attr("x2", 95).attr("y1", 0).attr("y2", 0).attr("stroke", colors.earningsLine).attr("stroke-width", 1.5).attr("stroke-dasharray", "4,3");
      legend.append("text").attr("x", 100).attr("y", 4).attr("fill", colors.legendText).attr("font-size", "11px").text("Earnings");

      return () => {
        svg.selectAll("*").remove();
        svg.on("mousemove", null).on("mouseleave", null);
        earningsTooltip.remove();
      };
    }

    return () => {
      svg.selectAll("*").remove();
      svg.on("mousemove", null).on("mouseleave", null);
    };
  }, [filteredPrices, earnings, colors, resolvedTheme]);

  if (loading) {
    return (
      <Card className="bg-white dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle className="text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <LineChart className="h-5 w-5 text-blue-400" />
            Price History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-[300px] bg-neutral-200/50 dark:bg-neutral-700/30 rounded" />
        </CardContent>
      </Card>
    );
  }

  if (prices.length === 0) return null;

  return (
    <Card className="bg-white dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <LineChart className="h-5 w-5 text-blue-400" />
          Price History
        </CardTitle>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={days === 30 ? "default" : "ghost"}
            onClick={() => setDays(30)}
            className={days === 30 ? "bg-blue-600 hover:bg-blue-700" : "text-neutral-500 dark:text-gray-400"}
          >
            30D
          </Button>
          <Button
            size="sm"
            variant={days === 90 ? "default" : "ghost"}
            onClick={() => setDays(90)}
            className={days === 90 ? "bg-blue-600 hover:bg-blue-700" : "text-neutral-500 dark:text-gray-400"}
          >
            90D
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="relative">
          <svg ref={svgRef} />
        </div>
      </CardContent>
    </Card>
  );
}
