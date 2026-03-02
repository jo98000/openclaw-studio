const fs = require("node:fs");
const path = require("node:path");
const { confirm } = require("../lib/prompts");
const { api } = require("../lib/api-client");

const run = async (args) => {
  // Parse --file flag
  let filePath = ".env";
  const fileIdx = args.indexOf("--file");
  if (fileIdx >= 0 && args[fileIdx + 1]) {
    filePath = args[fileIdx + 1];
  }

  const absolutePath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`  File not found: ${absolutePath}`);
    console.error(`  Usage: openclaw import-env [--file <path>]`);
    process.exit(1);
  }

  console.log(`\n  Scanning ${filePath} for API keys and credentials...\n`);

  const content = fs.readFileSync(absolutePath, "utf8");

  let result;
  try {
    result = await api.post("/api/credentials/env-import", { content });
  } catch (err) {
    console.error(`  Error: ${err.message}`);
    console.error("  Make sure OpenClaw Studio is running.\n");
    process.exit(1);
  }

  const { providers = [], credentials = [], unmatched = [] } = result;

  if (providers.length === 0 && credentials.length === 0) {
    console.log("  No recognized API keys or credentials found.\n");
    if (unmatched.length > 0) {
      console.log(`  Unrecognized keys: ${unmatched.join(", ")}\n`);
    }
    return;
  }

  if (providers.length > 0) {
    console.log(`  AI Providers found (${providers.length}):`);
    for (const p of providers) {
      console.log(`    ${p.serviceType.padEnd(20)} ${p.apiKey.slice(0, 8)}${"*".repeat(8)}`);
    }
    console.log("");
  }

  if (credentials.length > 0) {
    console.log(`  Credentials found (${credentials.length}):`);
    for (const c of credentials) {
      const fieldNames = c.fields.map((f) => f.key).join(", ");
      console.log(`    ${c.serviceType.padEnd(20)} fields: ${fieldNames}`);
    }
    console.log("");
  }

  const proceed = await confirm("  Import all detected items?");
  if (!proceed) {
    console.log("  Cancelled.\n");
    return;
  }

  console.log("  Imported.\n");

  if (unmatched.length > 0) {
    console.log(`  Note: ${unmatched.length} unrecognized key(s) skipped.`);
    console.log(`  ${unmatched.slice(0, 10).join(", ")}${unmatched.length > 10 ? "..." : ""}\n`);
  }
};

module.exports = { run };
