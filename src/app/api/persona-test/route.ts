import { NextResponse } from "next/server";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// POST /api/persona-test
// Evaluates whether a persona's response to a prompt meets a given criteria.
// Returns a pass/fail verdict, a 0-1 score, and an explanation.
//
// TODO: Replace the placeholder logic with an actual LLM-as-judge evaluation.
//       1. Generate a response from the agent LLM (using persona + prompt).
//       2. Feed the response + criteria into a judge LLM.
//       3. Parse the judge's structured verdict and return it.
// ---------------------------------------------------------------------------

type PersonaTestRequestBody = {
  persona: {
    name?: string;
    vibe?: string;
    coreTruths?: string;
    boundaries?: string;
    traits?: Record<string, number>;
  };
  directives: {
    mission?: string;
    rules?: string;
    outputFormat?: string;
  };
  prompt: string;
  criteria: string;
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

    const { prompt, criteria } = body as Partial<PersonaTestRequestBody>;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "prompt is required." },
        { status: 400 },
      );
    }
    if (!criteria || typeof criteria !== "string" || !criteria.trim()) {
      return NextResponse.json(
        { error: "criteria is required." },
        { status: 400 },
      );
    }

    // ------------------------------------------------------------------
    // PLACEHOLDER — always returns a passing result.
    // In production an LLM judge would evaluate the agent's response
    // against the criteria and return a meaningful verdict.
    // ------------------------------------------------------------------

    return NextResponse.json({
      pass: true,
      score: 0.8,
      explanation:
        "Test evaluation requires LLM integration. " +
        "This is a placeholder result — connect a gateway to enable real evaluation.",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Test evaluation failed.";
    console.error("Persona test error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
