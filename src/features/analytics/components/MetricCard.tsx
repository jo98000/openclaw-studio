"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { MetricSnapshot } from "../types";

type MetricCardProps = {
  metric: MetricSnapshot;
};

export const MetricCard = ({ metric }: MetricCardProps) => {
  const formatValue = (value: number): string => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return String(value);
  };

  return (
    <div className="ui-card p-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {metric.label}
      </p>
      <div className="mt-1 flex items-end justify-between">
        <span className="text-lg font-bold text-foreground">
          {formatValue(metric.value)}
          {metric.unit ? <span className="ml-0.5 text-xs font-normal text-muted-foreground">{metric.unit}</span> : null}
        </span>
        {metric.trendPercent > 0 && (
          <span
            className={`flex items-center gap-0.5 text-[10px] font-semibold ${
              metric.trend === "up"
                ? metric.id === "error-rate" ? "text-destructive" : "text-emerald-500"
                : metric.trend === "down"
                  ? metric.id === "error-rate" ? "text-emerald-500" : "text-destructive"
                  : "text-muted-foreground"
            }`}
          >
            {metric.trend === "up" ? <TrendingUp className="h-3 w-3" /> : null}
            {metric.trend === "down" ? <TrendingDown className="h-3 w-3" /> : null}
            {metric.trend === "flat" ? <Minus className="h-3 w-3" /> : null}
            {metric.trendPercent}%
          </span>
        )}
      </div>
    </div>
  );
};
