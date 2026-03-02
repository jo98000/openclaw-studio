import { NextResponse } from "next/server";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// POST /api/persona-preview
// Accepts a persona definition + a single prompt and returns a simulated
// response showing how the agent would reply.
//
// TODO: Replace the placeholder logic with actual LLM integration via the
//       gateway client. The system prompt should be assembled from the persona
//       & directives, then streamed back to the client.
// ---------------------------------------------------------------------------

type PersonaPreviewRequestBody = {
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

    const { persona, directives, prompt } =
      body as Partial<PersonaPreviewRequestBody>;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "prompt is required." },
        { status: 400 },
      );
    }

    // ------------------------------------------------------------------
    // PLACEHOLDER response — simulates what the agent would say.
    // In production this would call the LLM through the gateway.
    // ------------------------------------------------------------------

    const agentName = persona?.name || "This agent";
    const vibe = persona?.vibe || "helpful and versatile";
    const mission = directives?.mission || "general assistance";
    const rules = directives?.rules || "no specific rules defined";
    const outputFormat = directives?.outputFormat || "flexible";
    const boundaries = persona?.boundaries || "none specified";

    const response = [
      `**[Preview — ${agentName}]**`,
      "",
      `> Prompt: "${prompt.trim()}"`,
      "",
      `As an agent with a *${vibe}* personality whose mission is "${mission}", ` +
        `I would respond to this prompt while following these rules: ${rules}.`,
      "",
      `My boundaries include: ${boundaries}.`,
      `I would format my output as: ${outputFormat}.`,
      "",
      "*This is a simulated preview. Connect an LLM via the gateway to see real responses.*",
    ].join("\n");

    return NextResponse.json({ response });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Preview generation failed.";
    console.error("Persona preview error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
