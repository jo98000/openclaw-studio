"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { BarChart3 } from "lucide-react";
import type { TimeRange } from "../types";
import { initCollector, getMetrics, getTimeSeries, getAgentLeaderboard } from "../analyticsCollector";
import { MetricCard } from "./MetricCard";
import { TimeSeriesChart } from "./TimeSeriesChart";
import { AgentLeaderboard } from "./AgentLeaderboard";

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
];

const SERIES_COLORS: Record<string, string> = {
  "messages-sent": "#3b82f6",
  "messages-received": "#10b981",
  "error-rate": "#ef4444",
};

const SERIES_LABELS: Record<string, string> = {
  "messages-sent": "Messages Sent",
  "messages-received": "Messages Received",
  "error-rate": "Errors",
};

export const AnalyticsDashboard = () => {
  const t = useTranslations("analytics");
  const [range, setRange] = useState<TimeRange>("24h");

  useEffect(() => {
    initCollector();
  }, []);

  const metrics = useMemo(() => getMetrics(range), [range]);
  const timeSeries = useMemo(() => getTimeSeries(range), [range]);
  const leaderboard = useMemo(() => getAgentLeaderboard(range), [range]);

  return (
    <div className="flex h-full flex-col" data-testid="analytics-dashboard">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-foreground">{t("title")}</h2>
        </div>
        <div className="flex gap-1">
          {TIME_RANGES.map((tr) => (
            <button
              key={tr.value}
              type="button"
              onClick={() => setRange(tr.value)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                range === tr.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-2 text-muted-foreground hover:bg-surface-3"
              }`}
            >
              {tr.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="mb-3 text-xs text-muted-foreground">{t("description")}</p>

        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {timeSeries.map((series) => (
            <TimeSeriesChart
              key={series.metricId}
              series={series}
              color={SERIES_COLORS[series.metricId] ?? "var(--color-primary)"}
              label={SERIES_LABELS[series.metricId] ?? series.metricId}
            />
          ))}
        </div>

        <AgentLeaderboard agents={leaderboard} />
      </div>
    </div>
  );
};
