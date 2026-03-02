"use client";
import { useState, useCallback } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PersonaBuilderResult } from "@/features/agents/creation/personaBuilderSchema";

type ConversationalBuilderProps = {
  onResult: (result: PersonaBuilderResult) => void;
};

export const ConversationalBuilder = ({
  onResult,
}: ConversationalBuilderProps) => {
  const t = useTranslations("createAgent");
  const [description, setDescription] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PersonaBuilderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [turn, setTurn] = useState(0);

  const generate = useCallback(async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/persona-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          feedback: feedback.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data.result);
      setTurn((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }, [description, feedback]);

  const handleContinue = useCallback(() => {
    if (result) onResult(result);
  }, [result, onResult]);

  if (result) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            Generated Persona
          </p>
          <p className="text-sm font-medium text-foreground">{result.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {result.persona.vibe}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {result.directives.mission}
          </p>
        </div>
        {turn < 3 ? (
          <div className="space-y-2">
            <textarea
              className="h-16 w-full resize-none rounded-md border border-border/80 bg-background px-3 py-2 text-sm text-foreground outline-none"
              placeholder="Refine: e.g. 'Make it more formal' or 'Add coding expertise'..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="ui-btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs"
                onClick={generate}
                disabled={loading}
              >
                <RefreshCw className="h-3 w-3" />
                Refine
              </button>
              <button
                type="button"
                className="ui-btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs"
                onClick={handleContinue}
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="ui-btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs"
            onClick={handleContinue}
          >
            Continue
          </button>
        )}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <textarea
        className="h-28 w-full resize-y rounded-md border border-border/80 bg-background px-4 py-3 text-sm text-foreground outline-none"
        placeholder={t("conversationalPlaceholder")}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button
        type="button"
        className="ui-btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
        onClick={generate}
        disabled={loading || !description.trim()}
      >
        <Sparkles className="h-4 w-4" />
        {loading ? t("generating") : t("generate")}
      </button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
};
