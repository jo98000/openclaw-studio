import { useState, useCallback } from "react";
import type { PersonalityTraits } from "@/lib/agents/personalityTraits";
import { DEFAULT_TRAITS } from "@/lib/agents/personalityTraits";
import type { AgentTemplate } from "@/features/agents/templates/agentTemplates";
import { getTemplateById } from "@/features/agents/templates/agentTemplates";
import type { AgentCreateModalSubmitPayload } from "@/features/agents/creation/types";

type CreationMode = "template" | "conversational" | "blank";
type WizardStep = 0 | 1 | 2 | 3 | 4;

type WizardState = {
  // Step 0 — Mode
  creationMode: CreationMode | null;
  // Step 1 — Identity
  name: string;
  avatarSeed: string;
  description: string;
  templateId: string | null;
  // Step 2 — Persona & Directives
  traits: PersonalityTraits;
  vibe: string;
  coreTruths: string;
  boundaries: string;
  mission: string;
  rules: string;
  priorities: string;
  outputFormat: string;
  userName: string;
  userPronouns: string;
  userTimezone: string;
  userNotes: string;
  // Step 3 — Model
  modelKey: string;
  // Step 4 — Capabilities
  commandMode: "off" | "ask" | "auto";
  webAccess: boolean;
  fileTools: boolean;
};

const randomUUID = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const createInitialState = (suggestedName: string): WizardState => ({
  creationMode: null,
  name: suggestedName,
  avatarSeed: randomUUID(),
  description: "",
  templateId: null,
  traits: { ...DEFAULT_TRAITS },
  vibe: "",
  coreTruths: "",
  boundaries: "",
  mission: "",
  rules: "",
  priorities: "",
  outputFormat: "",
  userName: "",
  userPronouns: "",
  userTimezone: "",
  userNotes: "",
  modelKey: "",
  commandMode: "ask",
  webAccess: false,
  fileTools: false,
});

export function useCreateAgentWizard(suggestedName: string) {
  const [step, setStep] = useState<WizardStep>(0);
  const [state, setState] = useState<WizardState>(() =>
    createInitialState(suggestedName),
  );

  const set = useCallback(
    <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const applyTemplate = useCallback((template: AgentTemplate) => {
    setState((prev) => ({
      ...prev,
      templateId: template.id,
      modelKey: template.defaultModel || prev.modelKey,
      commandMode: template.capabilities.commandMode,
      webAccess: template.capabilities.webAccess,
      fileTools: template.capabilities.fileTools,
      traits: template.persona.traits,
      vibe: template.persona.vibe,
      coreTruths: template.persona.coreTruths,
      boundaries: template.persona.boundaries,
      mission: template.directives.mission,
      rules: template.directives.rules,
      priorities: template.directives.priorities,
      outputFormat: template.directives.outputFormat,
    }));
  }, []);

  const goNext = useCallback(
    () => setStep((s) => Math.min(s + 1, 4) as WizardStep),
    [],
  );
  const goPrev = useCallback(
    () => setStep((s) => Math.max(s - 1, 0) as WizardStep),
    [],
  );
  const goTo = useCallback((s: WizardStep) => setStep(s), []);

  const canProceedFromStep = useCallback(
    (s: WizardStep): boolean => {
      switch (s) {
        case 0:
          return state.creationMode !== null;
        case 1:
          return state.name.trim().length > 0;
        case 2:
          return true; // persona is encouraged but not required
        case 3:
          return true; // model has a default
        case 4:
          return true;
        default:
          return false;
      }
    },
    [state.creationMode, state.name],
  );

  const buildPayload = useCallback((): AgentCreateModalSubmitPayload => {
    const hasPersona = state.vibe || state.coreTruths || state.boundaries;
    const hasDirectives =
      state.mission || state.rules || state.priorities || state.outputFormat;
    const hasUserContext =
      state.userName ||
      state.userPronouns ||
      state.userTimezone ||
      state.userNotes;

    return {
      name: state.name.trim(),
      avatarSeed: state.avatarSeed,
      templateId: state.templateId ?? undefined,
      modelKey: state.modelKey || undefined,
      description: state.description.trim() || undefined,
      capabilities: {
        commandMode: state.commandMode,
        webAccess: state.webAccess,
        fileTools: state.fileTools,
      },
      persona: hasPersona
        ? {
            traits: state.traits,
            coreTruths: state.coreTruths || undefined,
            boundaries: state.boundaries || undefined,
            vibe: state.vibe || undefined,
          }
        : undefined,
      directives: hasDirectives
        ? {
            mission: state.mission || undefined,
            rules: state.rules || undefined,
            priorities: state.priorities || undefined,
            outputFormat: state.outputFormat || undefined,
          }
        : undefined,
      userContext: hasUserContext
        ? {
            name: state.userName || undefined,
            pronouns: state.userPronouns || undefined,
            timezone: state.userTimezone || undefined,
            notes: state.userNotes || undefined,
          }
        : undefined,
      creationMode: state.creationMode ?? undefined,
    };
  }, [state]);

  return {
    step,
    state,
    set,
    applyTemplate,
    goNext,
    goPrev,
    goTo,
    canProceedFromStep,
    buildPayload,
  };
}
