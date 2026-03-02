"use client";

import { useState, useCallback } from "react";
import { AlertTriangle, CheckCircle, Loader2, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PersonalityBuilderDraft } from "@/lib/agents/personalityBuilder";

type ValidationIssue = {
  severity: "warning" | "error";
  message: string;
  field: string;
};

type PersonaValidationBannerProps = {
  draft: PersonalityBuilderDraft;
};

export const PersonaValidationBanner = ({
  draft,
}: PersonaValidationBannerProps) => {
  const t = useTranslations("inspect");
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  const validate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/persona-validator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: {
            traits: draft.persona.traits,
            vibe: draft.persona.vibe,
            coreTruths: draft.persona.coreTruths,
            boundaries: draft.persona.boundaries,
          },
          directives: draft.directives,
        }),
      });
      const data = await res.json();
      setIssues(data.issues ?? []);
      setValidated(true);
    } catch {
      setIssues([
        {
          severity: "error",
          message: "Validation request failed",
          field: "unknown",
        },
      ]);
      setValidated(true);
    } finally {
      setLoading(false);
    }
  }, [draft]);

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="ui-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium disabled:opacity-50"
        disabled={loading}
        onClick={validate}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <ShieldCheck className="h-3 w-3" />
        )}
        {loading ? t("brainValidating") : t("brainValidate")}
      </button>

      {validated && issues.length === 0 ? (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
          {t("brainNoIssues")}
        </div>
      ) : null}

      {issues.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-amber-400">
            {t("brainIssuesFound")}
          </p>
          {issues.map((issue, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 rounded-md px-3 py-2 text-xs ${
                issue.severity === "error"
                  ? "border border-destructive/30 bg-destructive/10 text-destructive"
                  : "border border-amber-500/30 bg-amber-500/10 text-amber-300"
              }`}
            >
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              <span>{issue.message}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
