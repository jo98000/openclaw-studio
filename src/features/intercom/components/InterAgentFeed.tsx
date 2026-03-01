"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, ArrowRight } from "lucide-react";
import type { InterAgentMessage } from "../types";
import { initIntercomStore, getIntercomMessages } from "../intercomStore";

const MESSAGE_TYPE_COLORS: Record<InterAgentMessage["type"], string> = {
  text: "text-foreground",
  handoff: "text-amber-500",
  data: "text-blue-500",
  error: "text-destructive",
};

type InterAgentFeedProps = {
  agentId?: string;
};

export const InterAgentFeed = ({ agentId }: InterAgentFeedProps) => {
  const t = useTranslations("intercom");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    initIntercomStore();
    const interval = setInterval(() => setRefreshKey((k) => k + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const messages = useMemo(
    () => getIntercomMessages(agentId),
    [agentId, refreshKey],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="intercom-feed">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <MessageSquare className="h-4 w-4 text-primary" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-foreground">{t("title")}</h2>
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {messages.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="mb-3 text-xs text-muted-foreground">{t("description")}</p>

        {messages.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            {t("noMessages")}
          </p>
        ) : (
          <div className="space-y-2">
            {messages
              .slice()
              .reverse()
              .map((msg) => (
                <div key={msg.id} className="ui-card p-2">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="font-semibold text-primary">
                      {msg.fromAgentId}
                    </span>
                    <ArrowRight className="h-2.5 w-2.5" />
                    <span className="font-semibold text-primary">
                      {msg.toAgentId}
                    </span>
                    <span className="ml-auto">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p
                    className={`mt-1 text-xs ${MESSAGE_TYPE_COLORS[msg.type]}`}
                  >
                    {msg.content}
                  </p>
                  <span className="mt-0.5 inline-block rounded-full bg-surface-2 px-1.5 py-0.5 text-[9px] capitalize text-muted-foreground">
                    {msg.type}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
