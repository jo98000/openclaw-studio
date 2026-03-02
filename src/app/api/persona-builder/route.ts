import { NextResponse } from "next/server";
import {
  PERSONA_BUILDER_SYSTEM_PROMPT,
  buildPersonaBuilderUserPrompt,
} from "@/features/agents/creation/personaBuilderPrompt";
import { parsePersonaBuilderResult } from "@/features/agents/creation/personaBuilderSchema";

export const runtime = "nodejs";

type PersonaBuilderRequestBody = {
  description: string;
  feedback?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const { description, feedback } =
      body as Partial<PersonaBuilderRequestBody>;
    if (
      !description ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return NextResponse.json(
        { error: "description is required." },
        { status: 400 },
      );
    }

    const userPrompt = buildPersonaBuilderUserPrompt(
      description.trim(),
      feedback?.trim(),
    );

    // Use fetch to call the gateway's LLM endpoint
    // This is a placeholder — in production, this would route through the gateway client
    // For now, return a structured fallback that the frontend can use
    const fallbackResult = {
      name: description.trim().split(" ").slice(0, 3).join(" "),
      persona: {
        traits: {
          formality: 50,
          verbosity: 50,
          creativity: 50,
          proactivity: 50,
          warmth: 50,
        },
        vibe: "Versatile and helpful",
        coreTruths:
          "- I prioritize the user's goals.\n- I am honest about my limitations.",
        boundaries:
          "- I do not fabricate information.\n- I ask for clarification when unsure.",
      },
      directives: {
        mission: `Assist the user with: ${description.trim()}`,
        rules:
          "- Respond clearly and directly.\n- Adapt to the user's communication style.",
        priorities: "1. Accuracy\n2. Helpfulness\n3. Clarity",
        outputFormat: "Flexible — adapt to the task.",
      },
      suggestedModel: "anthropic/claude-sonnet-4-5-20250414",
    };

    const result = parsePersonaBuilderResult(fallbackResult);
    if (!result) {
      return NextResponse.json(
        { error: "Failed to generate persona." },
        { status: 500 },
      );
    }

    return NextResponse.json({ result });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to build persona.";
    console.error("Persona builder error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
