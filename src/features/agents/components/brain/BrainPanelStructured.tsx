"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Save, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { PersonalityTraitSliders } from "../creation/PersonalityTraitSliders";
import { PersonalityRadar } from "../persona/PersonalityRadar";
import type { PersonalityBuilderDraft } from "@/lib/agents/personalityBuilder";
import type { PersonalityTraits } from "@/lib/agents/personalityTraits";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BrainPanelStructuredProps = {
  draft: PersonalityBuilderDraft;
  onChange: (draft: PersonalityBuilderDraft) => void;
  onSave: () => void;
  saving?: boolean;
  dirty?: boolean;
};

// ---------------------------------------------------------------------------
// Reusable collapsible section (mirrors StepPersona pattern)
// ---------------------------------------------------------------------------

const CollapsibleSection = ({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-border/40 pt-4 first:border-t-0 first:pt-0">
      <button
        type="button"
        className="flex w-full items-center gap-2 text-left"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </button>
      {open ? <div className="mt-3 space-y-3">{children}</div> : null}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const inputCls =
  "h-9 rounded-md border border-border/80 bg-background px-3 text-sm text-foreground outline-none";

const textareaCls =
  "h-24 w-full resize-y rounded-md border border-border/80 bg-background px-3 py-2 font-mono text-sm text-foreground outline-none";

const smallTextareaCls =
  "h-20 w-full resize-y rounded-md border border-border/80 bg-background px-3 py-2 font-mono text-sm text-foreground outline-none";

const tinyTextareaCls =
  "h-16 w-full resize-y rounded-md border border-border/80 bg-background px-3 py-2 font-mono text-sm text-foreground outline-none";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const BrainPanelStructured = ({
  draft,
  onChange,
  onSave,
  saving = false,
  dirty = false,
}: BrainPanelStructuredProps) => {
  const t = useTranslations("createAgent");

  // Convenience updaters
  const updatePersona = (patch: Partial<PersonalityBuilderDraft["persona"]>) =>
    onChange({ ...draft, persona: { ...draft.persona, ...patch } });

  const updateDirectives = (
    patch: Partial<PersonalityBuilderDraft["directives"]>,
  ) => onChange({ ...draft, directives: { ...draft.directives, ...patch } });

  const updateUser = (patch: Partial<PersonalityBuilderDraft["user"]>) =>
    onChange({ ...draft, user: { ...draft.user, ...patch } });

  const handleTraitsChange = (traits: PersonalityTraits) =>
    updatePersona({ traits });

  return (
    <div className="flex flex-col gap-0">
      {/* ---- Header with save button ---- */}
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Brain
        </span>
        <button
          type="button"
          className="ui-btn-primary inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!dirty || saving}
          onClick={onSave}
        >
          {saving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Save className="h-3 w-3" />
          )}
          {saving ? t("launching") : "Save"}
        </button>
      </div>

      {/* ---- Scrollable content ---- */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-6">
          {/* ---- Radar visual summary ---- */}
          <div className="flex justify-center">
            <PersonalityRadar
              traits={draft.persona.traits}
              interactive
              onChange={handleTraitsChange}
              size={220}
            />
          </div>

          {/* ==== PERSONALITY ==== */}
          <CollapsibleSection title={t("sectionPersonality")}>
            <PersonalityTraitSliders
              traits={draft.persona.traits}
              onChange={handleTraitsChange}
            />

            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              {t("vibeLabel")}
              <input
                className={inputCls}
                value={draft.persona.vibe}
                onChange={(e) => updatePersona({ vibe: e.target.value })}
                placeholder="e.g. concise, friendly, technical..."
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              {t("coreTruthsLabel")}
              <textarea
                className={textareaCls}
                value={draft.persona.coreTruths}
                onChange={(e) => updatePersona({ coreTruths: e.target.value })}
                placeholder="Core beliefs and principles..."
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              {t("boundariesLabel")}
              <textarea
                className={smallTextareaCls}
                value={draft.persona.boundaries}
                onChange={(e) => updatePersona({ boundaries: e.target.value })}
                placeholder="Limits and things the agent should never do..."
              />
            </label>
          </CollapsibleSection>

          {/* ==== DIRECTIVES ==== */}
          <CollapsibleSection title={t("sectionMission")}>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              {t("missionLabel")}
              <input
                className={inputCls}
                value={draft.directives.mission}
                onChange={(e) => updateDirectives({ mission: e.target.value })}
                placeholder="Main mission in 1-2 sentences..."
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              {t("rulesLabel")}
              <textarea
                className={smallTextareaCls}
                value={draft.directives.rules}
                onChange={(e) => updateDirectives({ rules: e.target.value })}
                placeholder="Operating rules and guidelines..."
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              {t("prioritiesLabel")}
              <textarea
                className={tinyTextareaCls}
                value={draft.directives.priorities}
                onChange={(e) =>
                  updateDirectives({ priorities: e.target.value })
                }
                placeholder={"1. Accuracy\n2. Clarity\n3. Speed"}
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              {t("outputFormatLabel")}
              <input
                className={inputCls}
                value={draft.directives.outputFormat}
                onChange={(e) =>
                  updateDirectives({ outputFormat: e.target.value })
                }
                placeholder="e.g. Markdown, structured reports, code blocks..."
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Tool Notes
              <textarea
                className={smallTextareaCls}
                value={draft.directives.toolNotes}
                onChange={(e) =>
                  updateDirectives({ toolNotes: e.target.value })
                }
                placeholder="Notes about available tools and how to use them..."
              />
            </label>
          </CollapsibleSection>

          {/* ==== USER CONTEXT ==== */}
          <CollapsibleSection title={t("sectionContext")} defaultOpen={false}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                {t("userNameLabel")}
                <input
                  className={inputCls}
                  value={draft.user.name}
                  onChange={(e) => updateUser({ name: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Call Them
                <input
                  className={inputCls}
                  value={draft.user.callThem}
                  onChange={(e) => updateUser({ callThem: e.target.value })}
                  placeholder="How the agent addresses the user"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                {t("userPronounsLabel")}
                <input
                  className={inputCls}
                  value={draft.user.pronouns}
                  onChange={(e) => updateUser({ pronouns: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                {t("userTimezoneLabel")}
                <input
                  className={inputCls}
                  value={draft.user.timezone}
                  onChange={(e) => updateUser({ timezone: e.target.value })}
                  placeholder={Intl.DateTimeFormat().resolvedOptions().timeZone}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              {t("userNotesLabel")}
              <textarea
                className={tinyTextareaCls}
                value={draft.user.notes}
                onChange={(e) => updateUser({ notes: e.target.value })}
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Context
              <textarea
                className={textareaCls}
                value={draft.user.context}
                onChange={(e) => updateUser({ context: e.target.value })}
                placeholder="What do they care about? What projects are they working on?"
              />
            </label>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
};
