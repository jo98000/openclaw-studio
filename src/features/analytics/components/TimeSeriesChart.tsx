"use client";

import type { TimeSeries } from "../types";

type TimeSeriesChartProps = {
  series: TimeSeries;
  height?: number;
  color?: string;
  label?: string;
};

export const TimeSeriesChart = ({
  series,
  height = 80,
  color = "var(--color-primary)",
  label,
}: TimeSeriesChartProps) => {
  const points = series.points;
  if (points.length === 0) return null;

  const maxValue = Math.max(...points.map((p) => p.value), 1);
  const width = 100;
  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const pathPoints = points.map((p, i) => {
    const x = padding + (i / (points.length - 1)) * chartWidth;
    const y = padding + chartHeight - (p.value / maxValue) * chartHeight;
    return `${x},${y}`;
  });

  const linePath = `M ${pathPoints.join(" L ")}`;
  const areaPath = `${linePath} L ${padding + chartWidth},${padding + chartHeight} L ${padding},${padding + chartHeight} Z`;

  return (
    <div className="ui-card p-3">
      {label && (
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </p>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
        aria-label={label ?? "Time series chart"}
      >
        <defs>
          <linearGradient id={`gradient-${series.metricId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#gradient-${series.metricId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
        <span>{new Date(points[0].timestamp).toLocaleDateString()}</span>
        <span>{new Date(points[points.length - 1].timestamp).toLocaleDateString()}</span>
      </div>
    </div>
  );
};
