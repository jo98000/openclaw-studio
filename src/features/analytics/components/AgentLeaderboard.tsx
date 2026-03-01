"use client";

import { useTranslations } from "next-intl";
import type { AgentMetrics } from "../types";

type AgentLeaderboardProps = {
  agents: AgentMetrics[];
};

const formatTimeAgo = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const AgentLeaderboard = ({ agents }: AgentLeaderboardProps) => {
  const t = useTranslations("analytics");

  if (agents.length === 0) {
    return (
      <div className="ui-card p-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {t("agentLeaderboard")}
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">{t("noActivity")}</p>
      </div>
    );
  }

  return (
    <div className="ui-card p-3">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {t("agentLeaderboard")}
      </p>
      <div className="space-y-1.5">
        {agents.slice(0, 10).map((agent, i) => (
          <div key={agent.agentId} className="flex items-center gap-2 text-xs">
            <span className="w-4 text-right text-[10px] font-bold text-muted-foreground">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium text-foreground">
              {agent.agentName}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {agent.messageCount} {t("messages")}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {formatTimeAgo(agent.lastActive)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
