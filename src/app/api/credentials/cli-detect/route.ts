import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { detectCliCredentials } = require("../../../../../server/cli-detector");

export const runtime = "nodejs";

export async function GET() {
  try {
    const detected = detectCliCredentials();
    return NextResponse.json({ detected });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to detect CLI credentials.";
    console.error(message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
