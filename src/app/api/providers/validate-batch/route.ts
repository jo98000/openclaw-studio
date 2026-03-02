import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  validateProviderKey,
} = require("../../../../../server/provider-validators");

export const runtime = "nodejs";

type BatchEntry = {
  providerId: string;
  apiKey?: string;
  accessToken?: string;
  baseUrl?: string;
};

type BatchBody = {
  providers: BatchEntry[];
};

const isValidBody = (body: unknown): body is BatchBody =>
  Boolean(
    body &&
    typeof body === "object" &&
    Array.isArray((body as BatchBody).providers),
  );

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    if (!isValidBody(body)) {
      return NextResponse.json(
        {
          error:
            "Expected { providers: Array<{ providerId, apiKey?, accessToken?, baseUrl? }> }",
        },
        { status: 400 },
      );
    }

    const results = await Promise.allSettled(
      body.providers.map(async (entry) => {
        const secret = entry.apiKey || entry.accessToken || "";
        const result = (await validateProviderKey(
          entry.providerId,
          secret,
          entry.baseUrl,
        )) as {
          valid: boolean;
          error?: string;
        };
        return {
          providerId: entry.providerId,
          valid: result.valid,
          error: result.error ?? null,
        };
      }),
    );

    const response = results.map((r, i) => {
      if (r.status === "fulfilled") return r.value;
      return {
        providerId: body.providers[i].providerId,
        valid: false,
        error:
          r.reason instanceof Error ? r.reason.message : "Validation failed",
      };
    });

    return NextResponse.json({ results: response });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Batch validation failed";
    console.error("Batch provider validation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
