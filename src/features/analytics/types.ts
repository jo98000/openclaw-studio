export type MetricId =
  | "total-conversations"
  | "messages-sent"
  | "messages-received"
  | "avg-response-time"
  | "error-rate"
  | "tokens-consumed"
  | "active-agents"
  | "pending-approvals";

export type TimeRange = "24h" | "7d" | "30d";

export type TrendDirection = "up" | "down" | "flat";

export type MetricSnapshot = {
  id: MetricId;
  label: string;
  value: number;
  unit: string;
  trend: TrendDirection;
  trendPercent: number;
};

export type TimeSeriesPoint = {
  timestamp: number;
  value: number;
};

export type TimeSeries = {
  metricId: MetricId;
  points: TimeSeriesPoint[];
};

export type AgentMetrics = {
  agentId: string;
  agentName: string;
  messageCount: number;
  avgResponseTime: number;
  errorRate: number;
  tokensUsed: number;
  lastActive: number;
};

export type AnalyticsEvent = {
  type: "message.sent" | "message.received" | "agent.error" | "agent.started" | "agent.stopped" | "approval.requested" | "tokens.used";
  agentId: string;
  timestamp: number;
  payload?: Record<string, unknown>;
};
