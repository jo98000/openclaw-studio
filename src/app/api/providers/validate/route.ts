import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  validateProviderKey,
} = require("../../../../../server/provider-validators");

export const runtime = "nodejs";

type ValidateBody = {
  providerId: string;
  apiKey?: string;
  accessToken?: string;
  baseUrl?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ValidateBody;
    const { providerId, apiKey, accessToken, baseUrl } = body;

    if (!providerId) {
      return NextResponse.json(
        { error: "providerId is required" },
        { status: 400 },
      );
    }

    const secret = apiKey || accessToken || "";

    // Ollama doesn't need a secret, just a URL
    if (providerId !== "ollama" && !secret) {
      return NextResponse.json(
        { error: "apiKey or accessToken is required" },
        { status: 400 },
      );
    }

    const result = await validateProviderKey(providerId, secret, baseUrl);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Validation failed";
    console.error("Provider validation error:", message);
    return NextResponse.json({ valid: false, error: message }, { status: 500 });
  }
}
