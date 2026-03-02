import type { PersonalityTraits } from "@/lib/agents/personalityTraits";

export type PersonaBuilderResult = {
  name: string;
  persona: {
    traits: PersonalityTraits;
    vibe: string;
    coreTruths: string;
    boundaries: string;
  };
  directives: {
    mission: string;
    rules: string;
    priorities: string;
    outputFormat: string;
  };
  suggestedModel: string;
};

const clampTrait = (value: unknown): number => {
  const num = typeof value === "number" ? value : 50;
  return Math.max(0, Math.min(100, Math.round(num)));
};

export function parsePersonaBuilderResult(
  raw: unknown,
): PersonaBuilderResult | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const persona = obj.persona as Record<string, unknown> | undefined;
  const directives = obj.directives as Record<string, unknown> | undefined;
  const traits = (persona?.traits ?? {}) as Record<string, unknown>;

  return {
    name: typeof obj.name === "string" ? obj.name : "",
    persona: {
      traits: {
        formality: clampTrait(traits.formality),
        verbosity: clampTrait(traits.verbosity),
        creativity: clampTrait(traits.creativity),
        proactivity: clampTrait(traits.proactivity),
        warmth: clampTrait(traits.warmth),
      },
      vibe: typeof persona?.vibe === "string" ? persona.vibe : "",
      coreTruths:
        typeof persona?.coreTruths === "string" ? persona.coreTruths : "",
      boundaries:
        typeof persona?.boundaries === "string" ? persona.boundaries : "",
    },
    directives: {
      mission:
        typeof directives?.mission === "string" ? directives.mission : "",
      rules: typeof directives?.rules === "string" ? directives.rules : "",
      priorities:
        typeof directives?.priorities === "string" ? directives.priorities : "",
      outputFormat:
        typeof directives?.outputFormat === "string"
          ? directives.outputFormat
          : "",
    },
    suggestedModel:
      typeof obj.suggestedModel === "string" ? obj.suggestedModel : "",
  };
}
