import type { AnalyticsEvent, TimeRange, MetricSnapshot, TimeSeries, AgentMetrics, TrendDirection, TimeSeriesPoint } from "./types";

const MAX_EVENTS = 10000;
const STORAGE_KEY = "openclaw-studio:analytics-events";

let eventBuffer: AnalyticsEvent[] = [];

const loadEvents = (): AnalyticsEvent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AnalyticsEvent[];
  } catch {
    return [];
  }
};

const persistEvents = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(eventBuffer.slice(-MAX_EVENTS)));
};

export const initCollector = () => {
  eventBuffer = loadEvents();
};

export const pushEvent = (event: Omit<AnalyticsEvent, "timestamp">) => {
  eventBuffer.push({ ...event, timestamp: Date.now() });
  if (eventBuffer.length > MAX_EVENTS) {
    eventBuffer = eventBuffer.slice(-MAX_EVENTS);
  }
  persistEvents();
};

const rangeMs = (range: TimeRange): number => {
  switch (range) {
    case "24h": return 24 * 60 * 60 * 1000;
    case "7d": return 7 * 24 * 60 * 60 * 1000;
    case "30d": return 30 * 24 * 60 * 60 * 1000;
  }
};

const filterByRange = (events: AnalyticsEvent[], range: TimeRange): AnalyticsEvent[] => {
  const cutoff = Date.now() - rangeMs(range);
  return events.filter((e) => e.timestamp >= cutoff);
};

const computeTrend = (current: number, previous: number): { direction: TrendDirection; percent: number } => {
  if (previous === 0) return { direction: current > 0 ? "up" : "flat", percent: 0 };
  const pct = ((current - previous) / previous) * 100;
  return {
    direction: pct > 1 ? "up" : pct < -1 ? "down" : "flat",
    percent: Math.abs(Math.round(pct)),
  };
};

export const getMetrics = (range: TimeRange): MetricSnapshot[] => {
  const events = filterByRange(eventBuffer, range);
  const halfRange = rangeMs(range) / 2;
  const midpoint = Date.now() - halfRange;
  const recent = events.filter((e) => e.timestamp >= midpoint);
  const older = events.filter((e) => e.timestamp < midpoint);

  const conversations = new Set(events.filter((e) => e.type === "message.received").map((e) => e.agentId));
  const prevConversations = new Set(older.filter((e) => e.type === "message.received").map((e) => e.agentId));
  const convTrend = computeTrend(conversations.size, prevConversations.size);

  const sent = events.filter((e) => e.type === "message.sent").length;
  const prevSent = older.filter((e) => e.type === "message.sent").length;
  const sentTrend = computeTrend(sent, prevSent);

  const received = events.filter((e) => e.type === "message.received").length;
  const prevReceived = older.filter((e) => e.type === "message.received").length;
  const receivedTrend = computeTrend(received, prevReceived);

  const errors = events.filter((e) => e.type === "agent.error").length;
  const totalMsgs = sent + received;
  const errorRate = totalMsgs > 0 ? (errors / totalMsgs) * 100 : 0;
  const prevErrors = older.filter((e) => e.type === "agent.error").length;
  const prevTotal = prevSent + prevReceived;
  const prevErrorRate = prevTotal > 0 ? (prevErrors / prevTotal) * 100 : 0;
  const errorTrend = computeTrend(errorRate, prevErrorRate);

  const tokens = events
    .filter((e) => e.type === "tokens.used")
    .reduce((sum, e) => sum + ((e.payload?.count as number) ?? 0), 0);
  const prevTokens = older
    .filter((e) => e.type === "tokens.used")
    .reduce((sum, e) => sum + ((e.payload?.count as number) ?? 0), 0);
  const tokensTrend = computeTrend(tokens, prevTokens);

  const activeAgents = new Set(
    events.filter((e) => e.type === "agent.started").map((e) => e.agentId)
  ).size;

  const pendingApprovals = events.filter((e) => e.type === "approval.requested").length;

  return [
    { id: "total-conversations", label: "Conversations", value: conversations.size, unit: "", trend: convTrend.direction, trendPercent: convTrend.percent },
    { id: "messages-sent", label: "Sent", value: sent, unit: "msg", trend: sentTrend.direction, trendPercent: sentTrend.percent },
    { id: "messages-received", label: "Received", value: received, unit: "msg", trend: receivedTrend.direction, trendPercent: receivedTrend.percent },
    { id: "avg-response-time", label: "Avg Response", value: 0, unit: "ms", trend: "flat", trendPercent: 0 },
    { id: "error-rate", label: "Error Rate", value: Math.round(errorRate * 10) / 10, unit: "%", trend: errorTrend.direction, trendPercent: errorTrend.percent },
    { id: "tokens-consumed", label: "Tokens", value: tokens, unit: "", trend: tokensTrend.direction, trendPercent: tokensTrend.percent },
    { id: "active-agents", label: "Active Agents", value: activeAgents, unit: "", trend: "flat", trendPercent: 0 },
    { id: "pending-approvals", label: "Pending Approvals", value: pendingApprovals, unit: "", trend: "flat", trendPercent: 0 },
  ];
};

export const getTimeSeries = (range: TimeRange): TimeSeries[] => {
  const events = filterByRange(eventBuffer, range);
  const bucketCount = range === "24h" ? 24 : range === "7d" ? 7 : 30;
  const bucketSize = rangeMs(range) / bucketCount;
  const now = Date.now();

  const makeSeries = (type: AnalyticsEvent["type"]): TimeSeriesPoint[] => {
    const filtered = events.filter((e) => e.type === type);
    return Array.from({ length: bucketCount }, (_, i) => {
      const start = now - rangeMs(range) + i * bucketSize;
      const end = start + bucketSize;
      return {
        timestamp: start + bucketSize / 2,
        value: filtered.filter((e) => e.timestamp >= start && e.timestamp < end).length,
      };
    });
  };

  return [
    { metricId: "messages-sent", points: makeSeries("message.sent") },
    { metricId: "messages-received", points: makeSeries("message.received") },
    { metricId: "error-rate", points: makeSeries("agent.error") },
  ];
};

export const getAgentLeaderboard = (range: TimeRange): AgentMetrics[] => {
  const events = filterByRange(eventBuffer, range);
  const agentMap = new Map<string, AgentMetrics>();

  for (const event of events) {
    if (!agentMap.has(event.agentId)) {
      agentMap.set(event.agentId, {
        agentId: event.agentId,
        agentName: event.agentId,
        messageCount: 0,
        avgResponseTime: 0,
        errorRate: 0,
        tokensUsed: 0,
        lastActive: event.timestamp,
      });
    }
    const m = agentMap.get(event.agentId)!;
    if (event.type === "message.sent" || event.type === "message.received") m.messageCount++;
    if (event.type === "tokens.used") m.tokensUsed += (event.payload?.count as number) ?? 0;
    if (event.timestamp > m.lastActive) m.lastActive = event.timestamp;
  }

  return Array.from(agentMap.values()).sort((a, b) => b.messageCount - a.messageCount);
};
