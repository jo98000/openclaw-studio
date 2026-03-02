"use client";

import { useTranslations } from "next-intl";
import type { PersonalityTraits } from "@/lib/agents/personalityTraits";
import { TRAIT_DIMENSIONS, traitToText } from "@/lib/agents/personalityTraits";
import { PersonalityRadar } from "../persona/PersonalityRadar";

type AgentSummaryCardProps = {
  name?: string;
  vibe?: string;
  mission?: string;
  traits?: PersonalityTraits;
  modelKey?: string;
  boundariesCount?: number;
};

export const AgentSummaryCard = ({
  name,
  vibe,
  mission,
  traits,
  modelKey,
  boundariesCount,
}: AgentSummaryCardProps) => {
  const t = useTranslations("createAgent");

  return (
    <div className="rounded-lg border border-border/60 bg-card p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t("agentSummary") ?? "Agent Summary"}
      </p>

      <div>
        <p className="text-sm font-medium text-foreground">
          {name || "Unnamed Agent"}
        </p>
        {vibe ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{vibe}</p>
        ) : null}
      </div>

      {mission ? (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            {t("missionLabel")}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {mission}
          </p>
        </div>
      ) : null}

      {traits ? (
        <div className="flex flex-col items-center gap-2">
          <PersonalityRadar traits={traits} size={140} />
          <div className="w-full space-y-0.5">
            {TRAIT_DIMENSIONS.map((dim) => (
              <div
                key={dim}
                className="flex items-center justify-between text-[11px]"
              >
                <span className="text-muted-foreground capitalize">{dim}</span>
                <span className="text-foreground">
                  {traitToText(dim, traits[dim])}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        {modelKey ? <span>Model: {modelKey}</span> : null}
        {boundariesCount != null && boundariesCount > 0 ? (
          <span>
            {boundariesCount}{" "}
            {boundariesCount === 1 ? "boundary" : "boundaries"}
          </span>
        ) : null}
      </div>
    </div>
  );
};
