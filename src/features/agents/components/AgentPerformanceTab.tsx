"use client";

import { useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Activity, Clock, MessageSquare, Zap } from "lucide-react";
import type { AgentState } from "@/features/agents/state/store";

type AgentPerformanceTabProps = {
  agent: AgentState;
};

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
};

const formatRelative = (timestampMs: number | null): string => {
  if (!timestampMs) return "—";
  const delta = Date.now() - timestampMs;
  if (delta < 60_000) return "Just now";
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)}m ago`;
  if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)}h ago`;
  return `${Math.floor(delta / 86_400_000)}d ago`;
};

export const AgentPerformanceTab = ({ agent }: AgentPerformanceTabProps) => {
  const t = useTranslations("inspect");

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(id);
  }, []);

  const metrics = useMemo(() => {
    const outputCount = agent.outputLines.length;
    const runDuration =
      agent.runStartedAt && agent.status === "running"
        ? now - agent.runStartedAt
        : null;
    const lastActive = agent.lastActivityAt;
    const lastAssistant = agent.lastAssistantMessageAt;

    return { outputCount, runDuration, lastActive, lastAssistant };
  }, [agent, now]);

  const cards = [
    {
      icon: MessageSquare,
      label: "Messages",
      value: String(metrics.outputCount),
      sub: "output lines",
    },
    {
      icon: Activity,
      label: "Status",
      value: agent.status,
      sub: agent.sessionCreated ? "Session active" : "No session",
    },
    {
      icon: Clock,
      label: "Last Activity",
      value: formatRelative(metrics.lastActive),
      sub: metrics.lastAssistant
        ? `Last response ${formatRelative(metrics.lastAssistant)}`
        : "No response yet",
    },
    {
      icon: Zap,
      label: "Current Run",
      value: metrics.runDuration ? formatDuration(metrics.runDuration) : "—",
      sub: agent.runId ? `Run ${agent.runId.slice(0, 8)}…` : "No active run",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          {t("performanceTitle") ?? "Performance"}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("performanceDescription") ?? "Runtime metrics for this agent."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="ui-card p-4">
            <div className="flex items-center gap-2">
              <card.icon className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="text-xs font-medium text-muted-foreground">
                {card.label}
              </span>
            </div>
            <div className="mt-2 text-lg font-semibold text-foreground">
              {card.value}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="ui-card p-4">
        <h4 className="mb-3 text-xs font-semibold text-foreground">
          Session Details
        </h4>
        <dl className="grid grid-cols-2 gap-y-2 text-xs">
          <dt className="text-muted-foreground">Agent ID</dt>
          <dd className="font-mono text-foreground">{agent.agentId}</dd>
          <dt className="text-muted-foreground">Session Key</dt>
          <dd className="truncate font-mono text-foreground">
            {agent.sessionKey}
          </dd>
          <dt className="text-muted-foreground">Model</dt>
          <dd className="font-mono text-foreground">
            {agent.model ?? "Default"}
          </dd>
          <dt className="text-muted-foreground">Thinking Level</dt>
          <dd className="font-mono text-foreground">
            {agent.thinkingLevel ?? "low"}
          </dd>
          <dt className="text-muted-foreground">Tool Calling</dt>
          <dd className="font-mono text-foreground">
            {agent.toolCallingEnabled ? "Enabled" : "Disabled"}
          </dd>
        </dl>
      </div>
    </div>
  );
};
