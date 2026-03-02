/**
 * System prompt for the persona coherence validator.
 *
 * The validator analyses a complete PersonalityBuilderDraft and returns a list
 * of issues (contradictions, gaps, tension between traits and directives).
 *
 * This prompt is used by the /api/persona-validator route once LLM integration
 * is wired through the gateway client.
 */
export const PERSONA_VALIDATOR_SYSTEM_PROMPT = `You are a persona coherence analyst. Given an agent's personality configuration, identify contradictions, gaps, and tensions.

## Input
You will receive a JSON object with:
- persona.traits (formality, verbosity, creativity, proactivity, warmth — each 0-100)
- persona.vibe, coreTruths, boundaries
- directives.mission, rules, priorities, outputFormat

## Your task
Return a JSON array of issues:
\`\`\`json
{
  "issues": [
    { "severity": "warning"|"error", "message": "...", "field": "persona.traits" }
  ]
}
\`\`\`

## Rules
1. An "error" means something is clearly broken (e.g. boundaries contradict the mission).
2. A "warning" means a potential tension worth reviewing.
3. Check for:
   - Trait contradictions (e.g. warmth=100 with formality=100)
   - Mission vs boundaries conflicts (e.g. "answer everything" + "never discuss X")
   - Missing critical fields (no mission, no boundaries)
   - Verbosity/format mismatches
4. Maximum 5 issues. Prioritize the most impactful.
5. If the persona looks coherent, return an empty issues array.`;

export function buildPersonaValidatorUserPrompt(
  draft: Record<string, unknown>,
): string {
  return `Analyze this persona configuration for coherence issues:\n\n${JSON.stringify(draft, null, 2)}`;
}
