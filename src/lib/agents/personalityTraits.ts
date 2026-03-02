// ---------------------------------------------------------------------------
// Personality trait dimensions — numeric 0-100 scale with text labels.
// ---------------------------------------------------------------------------

export type PersonalityTraits = {
  formality: number; // 0 = casual, 100 = formal
  verbosity: number; // 0 = concise, 100 = verbose
  creativity: number; // 0 = precise, 100 = creative
  proactivity: number; // 0 = reactive, 100 = proactive
  warmth: number; // 0 = neutral, 100 = warm
};

export const TRAIT_DIMENSIONS = [
  "formality",
  "verbosity",
  "creativity",
  "proactivity",
  "warmth",
] as const;

export type TraitDimension = (typeof TRAIT_DIMENSIONS)[number];

export const DEFAULT_TRAITS: PersonalityTraits = {
  formality: 50,
  verbosity: 50,
  creativity: 50,
  proactivity: 50,
  warmth: 50,
};

// ---------------------------------------------------------------------------
// Dimension labels (for sliders / radar chart / etc.)
// ---------------------------------------------------------------------------

export const TRAIT_LABELS: Record<
  TraitDimension,
  { low: string; mid: string; high: string }
> = {
  formality: { low: "Casual", mid: "Semi-formal", high: "Formal" },
  verbosity: { low: "Concise", mid: "Balanced", high: "Verbose" },
  creativity: { low: "Precise", mid: "Balanced", high: "Creative" },
  proactivity: { low: "Reactive", mid: "Balanced", high: "Proactive" },
  warmth: { low: "Neutral", mid: "Friendly", high: "Warm" },
};

// ---------------------------------------------------------------------------
// Value → text
// ---------------------------------------------------------------------------

const traitBrackets = [
  { max: 15, label: "very low" },
  { max: 35, label: "low" },
  { max: 65, label: "medium" },
  { max: 85, label: "high" },
  { max: 100, label: "very high" },
] as const;

const dimensionTextMap: Record<TraitDimension, Record<string, string>> = {
  formality: {
    "very low": "very casual",
    low: "casual",
    medium: "semi-formal",
    high: "formal",
    "very high": "very formal",
  },
  verbosity: {
    "very low": "ultra-concise",
    low: "concise",
    medium: "balanced",
    high: "detailed",
    "very high": "very detailed",
  },
  creativity: {
    "very low": "very precise",
    low: "precise",
    medium: "balanced",
    high: "creative",
    "very high": "very creative",
  },
  proactivity: {
    "very low": "very reactive",
    low: "reactive",
    medium: "balanced",
    high: "proactive",
    "very high": "very proactive",
  },
  warmth: {
    "very low": "very neutral",
    low: "neutral",
    medium: "friendly",
    high: "warm",
    "very high": "very warm",
  },
};

export function traitToText(dimension: TraitDimension, value: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const bracket =
    traitBrackets.find((b) => clamped <= b.max) ?? traitBrackets[4];
  return dimensionTextMap[dimension][bracket.label] ?? bracket.label;
}

// ---------------------------------------------------------------------------
// Text → value (bidirectional)
// ---------------------------------------------------------------------------

const reverseMap: Map<string, { dimension: TraitDimension; value: number }> =
  new Map();

for (const dim of TRAIT_DIMENSIONS) {
  const entries: [string, number][] = [
    [dimensionTextMap[dim]["very low"], 10],
    [dimensionTextMap[dim].low, 25],
    [dimensionTextMap[dim].medium, 50],
    [dimensionTextMap[dim].high, 75],
    [dimensionTextMap[dim]["very high"], 90],
  ];
  for (const [text, val] of entries) {
    reverseMap.set(text.toLowerCase(), { dimension: dim, value: val });
  }
}

export function textToTrait(
  text: string,
): { dimension: TraitDimension; value: number } | null {
  return reverseMap.get(text.toLowerCase().trim()) ?? null;
}

// ---------------------------------------------------------------------------
// Serialize traits to markdown section content
// ---------------------------------------------------------------------------

export function serializeTraitsToMarkdown(traits: PersonalityTraits): string {
  return TRAIT_DIMENSIONS.map(
    (dim) =>
      `- ${dim[0].toUpperCase()}${dim.slice(1)}: ${traits[dim]} (${traitToText(dim, traits[dim])})`,
  ).join("\n");
}

// ---------------------------------------------------------------------------
// Parse traits from markdown section content
// ---------------------------------------------------------------------------

export function parseTraitsFromMarkdown(content: string): PersonalityTraits {
  const traits = { ...DEFAULT_TRAITS };
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^[-*]\s*(\w+):\s*(\d+)/i);
    if (!match) continue;
    const key = match[1].toLowerCase() as TraitDimension;
    if (TRAIT_DIMENSIONS.includes(key)) {
      traits[key] = Math.max(0, Math.min(100, parseInt(match[2], 10)));
    }
  }
  return traits;
}
