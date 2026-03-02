"use client";
import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { PersonalityTraitSliders } from "./PersonalityTraitSliders";
import type { PersonalityTraits } from "@/lib/agents/personalityTraits";

type StepPersonaProps = {
  traits: PersonalityTraits;
  onTraitsChange: (traits: PersonalityTraits) => void;
  coreTruths: string;
  onCoreTruthsChange: (value: string) => void;
  boundaries: string;
  onBoundariesChange: (value: string) => void;
  vibe: string;
  onVibeChange: (value: string) => void;
  mission: string;
  onMissionChange: (value: string) => void;
  rules: string;
  onRulesChange: (value: string) => void;
  priorities: string;
  onPrioritiesChange: (value: string) => void;
  outputFormat: string;
  onOutputFormatChange: (value: string) => void;
  userName: string;
  onUserNameChange: (value: string) => void;
  userPronouns: string;
  onUserPronounsChange: (value: string) => void;
  userTimezone: string;
  onUserTimezoneChange: (value: string) => void;
  userNotes: string;
  onUserNotesChange: (value: string) => void;
};

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

export const StepPersona = (props: StepPersonaProps) => {
  const t = useTranslations("createAgent");
  return (
    <div className="space-y-6">
      <CollapsibleSection title={t("sectionPersonality")}>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {t("vibeLabel")}
          <input
            className="h-9 rounded-md border border-border/80 bg-background px-3 text-sm text-foreground outline-none"
            value={props.vibe}
            onChange={(e) => props.onVibeChange(e.target.value)}
            placeholder="e.g. concise, friendly, technical..."
          />
        </label>
        <PersonalityTraitSliders
          traits={props.traits}
          onChange={props.onTraitsChange}
        />
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {t("coreTruthsLabel")}
          <textarea
            className="h-24 w-full resize-y rounded-md border border-border/80 bg-background px-3 py-2 font-mono text-sm text-foreground outline-none"
            value={props.coreTruths}
            onChange={(e) => props.onCoreTruthsChange(e.target.value)}
            placeholder="Core beliefs and principles..."
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {t("boundariesLabel")}
          <textarea
            className="h-20 w-full resize-y rounded-md border border-border/80 bg-background px-3 py-2 font-mono text-sm text-foreground outline-none"
            value={props.boundaries}
            onChange={(e) => props.onBoundariesChange(e.target.value)}
            placeholder="Limits and things the agent should never do..."
          />
        </label>
      </CollapsibleSection>

      <CollapsibleSection title={t("sectionMission")}>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {t("missionLabel")}
          <input
            className="h-9 rounded-md border border-border/80 bg-background px-3 text-sm text-foreground outline-none"
            value={props.mission}
            onChange={(e) => props.onMissionChange(e.target.value)}
            placeholder="Main mission in 1-2 sentences..."
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {t("rulesLabel")}
          <textarea
            className="h-20 w-full resize-y rounded-md border border-border/80 bg-background px-3 py-2 font-mono text-sm text-foreground outline-none"
            value={props.rules}
            onChange={(e) => props.onRulesChange(e.target.value)}
            placeholder="Operating rules and guidelines..."
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {t("prioritiesLabel")}
          <textarea
            className="h-16 w-full resize-y rounded-md border border-border/80 bg-background px-3 py-2 font-mono text-sm text-foreground outline-none"
            value={props.priorities}
            onChange={(e) => props.onPrioritiesChange(e.target.value)}
            placeholder="1. Accuracy\n2. Clarity\n3. Speed"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {t("outputFormatLabel")}
          <input
            className="h-9 rounded-md border border-border/80 bg-background px-3 text-sm text-foreground outline-none"
            value={props.outputFormat}
            onChange={(e) => props.onOutputFormatChange(e.target.value)}
            placeholder="e.g. Markdown, structured reports, code blocks..."
          />
        </label>
      </CollapsibleSection>

      <CollapsibleSection title={t("sectionContext")} defaultOpen={false}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            {t("userNameLabel")}
            <input
              className="h-9 rounded-md border border-border/80 bg-background px-3 text-sm text-foreground outline-none"
              value={props.userName}
              onChange={(e) => props.onUserNameChange(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            {t("userPronounsLabel")}
            <input
              className="h-9 rounded-md border border-border/80 bg-background px-3 text-sm text-foreground outline-none"
              value={props.userPronouns}
              onChange={(e) => props.onUserPronounsChange(e.target.value)}
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {t("userTimezoneLabel")}
          <input
            className="h-9 rounded-md border border-border/80 bg-background px-3 text-sm text-foreground outline-none"
            value={props.userTimezone}
            onChange={(e) => props.onUserTimezoneChange(e.target.value)}
            placeholder={Intl.DateTimeFormat().resolvedOptions().timeZone}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {t("userNotesLabel")}
          <textarea
            className="h-16 w-full resize-y rounded-md border border-border/80 bg-background px-3 py-2 text-sm text-foreground outline-none"
            value={props.userNotes}
            onChange={(e) => props.onUserNotesChange(e.target.value)}
          />
        </label>
      </CollapsibleSection>
    </div>
  );
};
