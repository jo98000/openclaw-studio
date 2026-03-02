"use client";

import { useState, useCallback } from "react";
import { Play, Loader2, AlertTriangle, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PersonalityTraits } from "@/lib/agents/personalityTraits";
import { TRAIT_DIMENSIONS, traitToText } from "@/lib/agents/personalityTraits";
import { generatePreviewPrompts } from "@/features/agents/creation/previewPrompts";
import type { PreviewPrompt } from "@/features/agents/creation/previewPrompts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PersonaPreviewProps = {
  persona: {
    name?: string;
    vibe?: string;
    coreTruths?: string;
    boundaries?: string;
    traits?: PersonalityTraits;
  };
  directives: {
    mission?: string;
    rules?: string;
    outputFormat?: string;
  };
};

type PromptResult = {
  id: string;
  response: string | null;
  loading: boolean;
  error: string | null;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const PersonaPreview = ({
  persona,
  directives,
}: PersonaPreviewProps) => {
  const t = useTranslations("createAgent");

  const prompts = generatePreviewPrompts(
    {
      vibe: persona.vibe,
      coreTruths: persona.coreTruths,
      boundaries: persona.boundaries,
    },
    { mission: directives.mission },
  );

  const [results, setResults] = useState<Record<string, PromptResult>>({});

  // -----------------------------------------------------------------------
  // Run a single preview prompt
  // -----------------------------------------------------------------------
  const runPrompt = useCallback(
    async (prompt: PreviewPrompt) => {
      setResults((prev) => ({
        ...prev,
        [prompt.id]: {
          id: prompt.id,
          response: null,
          loading: true,
          error: null,
        },
      }));

      try {
        const res = await fetch("/api/persona-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            persona,
            directives,
            prompt: prompt.prompt,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Preview request failed");

        setResults((prev) => ({
          ...prev,
          [prompt.id]: {
            id: prompt.id,
            response: data.response,
            loading: false,
            error: null,
          },
        }));
      } catch (err) {
        setResults((prev) => ({
          ...prev,
          [prompt.id]: {
            id: prompt.id,
            response: null,
            loading: false,
            error:
              err instanceof Error ? err.message : "Preview request failed",
          },
        }));
      }
    },
    [persona, directives],
  );

  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------
  const categoryColor: Record<PreviewPrompt["category"], string> = {
    identity: "bg-blue-500/15 text-blue-400",
    expertise: "bg-emerald-500/15 text-emerald-400",
    boundaries: "bg-amber-500/15 text-amber-400",
    tone: "bg-purple-500/15 text-purple-400",
    format: "bg-cyan-500/15 text-cyan-400",
  };

  return (
    <div className="space-y-5">
      {/* Preview banner */}
      <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
        <Eye className="h-3.5 w-3.5 shrink-0" />
        <span>
          {t("previewBanner") ?? "This is a preview — not a real conversation."}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
        {/* ---- Left: Agent summary card ---- */}
        <div className="rounded-lg border border-border/60 bg-card p-4 space-y-3 self-start">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("agentSummary") ?? "Agent Summary"}
          </p>

          {/* Name */}
          <div>
            <p className="text-sm font-medium text-foreground">
              {persona.name || "Unnamed Agent"}
            </p>
            {persona.vibe ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {persona.vibe}
              </p>
            ) : null}
          </div>

          {/* Mission */}
          {directives.mission ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {t("missionLabel") ?? "Mission"}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {directives.mission}
              </p>
            </div>
          ) : null}

          {/* Mini trait display */}
          {persona.traits ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {t("traitsLabel") ?? "Traits"}
              </p>
              <div className="space-y-1">
                {TRAIT_DIMENSIONS.map((dim) => (
                  <div
                    key={dim}
                    className="flex items-center justify-between text-[11px]"
                  >
                    <span className="text-muted-foreground capitalize">
                      {dim}
                    </span>
                    <span className="text-foreground">
                      {traitToText(dim, persona.traits![dim])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* ---- Right: Test prompts ---- */}
        <div className="space-y-3">
          {prompts.map((prompt) => {
            const result = results[prompt.id];

            return (
              <div
                key={prompt.id}
                className="rounded-lg border border-border/60 bg-card p-4 space-y-3"
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${categoryColor[prompt.category]}`}
                    >
                      {prompt.category}
                    </span>
                    <span className="text-xs font-medium text-foreground truncate">
                      {prompt.label}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="ui-btn-secondary flex items-center gap-1.5 px-2.5 py-1 text-xs shrink-0 disabled:opacity-50"
                    onClick={() => runPrompt(prompt)}
                    disabled={result?.loading}
                  >
                    {result?.loading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                    {t("runButton") ?? "Run"}
                  </button>
                </div>

                {/* Prompt text */}
                <p className="text-xs text-muted-foreground italic">
                  &ldquo;{prompt.prompt}&rdquo;
                </p>

                {/* Response / loading / error */}
                {result?.loading ? (
                  <div className="flex items-center gap-2 rounded-md bg-muted/30 px-3 py-3">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {t("generatingPreview") ?? "Generating preview..."}
                    </span>
                  </div>
                ) : null}

                {result?.error ? (
                  <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {result.error}
                  </div>
                ) : null}

                {result?.response ? (
                  <div className="rounded-md bg-muted/30 px-3 py-3">
                    <p className="whitespace-pre-wrap text-xs text-foreground leading-relaxed">
                      {result.response}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
