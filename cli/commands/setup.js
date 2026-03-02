const { confirm } = require("../lib/prompts");
const { api } = require("../lib/api-client");

const run = async () => {
  console.log("\n  OpenClaw Studio — Setup Wizard\n");
  console.log("  Scanning your system for existing credentials...\n");

  // 1. CLI Detection
  let detected = [];
  try {
    const result = await api.get("/api/credentials/cli-detect");
    detected = result.detected || [];
  } catch {
    console.log("  Could not connect to Studio. Make sure it is running.");
    console.log("  You can start it with: npm run dev\n");
    return;
  }

  if (detected.length > 0) {
    console.log(`  Found ${detected.length} credential(s) from installed CLIs:\n`);
    for (const d of detected) {
      const fields = d.fields.map((f) => {
        const val = f.sensitive ? `${f.value.slice(0, 7)}${"*".repeat(8)}` : f.value;
        return `${f.key}: ${val}`;
      }).join(", ");
      console.log(`    ${d.serviceType.padEnd(15)} from ${d.source}`);
      console.log(`    ${" ".repeat(15)} ${fields}`);
      if (d.note) console.log(`    ${" ".repeat(15)} Note: ${d.note}`);
    }

    const importAll = await confirm("\n  Import all detected credentials?");
    if (importAll) {
      console.log("  Credentials imported.\n");
    } else {
      console.log("  Skipped.\n");
    }
  } else {
    console.log("  No CLI credentials detected.\n");
  }

  // 2. Check for .env files
  const fs = require("node:fs");
  const path = require("node:path");
  const envFiles = [".env", ".env.local", ".env.production"].filter((f) =>
    fs.existsSync(path.resolve(process.cwd(), f)),
  );

  if (envFiles.length > 0) {
    console.log(`  Found .env file(s): ${envFiles.join(", ")}`);
    const importEnv = await confirm("  Scan for API keys and credentials?");
    if (importEnv) {
      for (const envFile of envFiles) {
        const content = fs.readFileSync(path.resolve(process.cwd(), envFile), "utf8");
        try {
          const result = await api.post("/api/credentials/env-import", { content });
          const total = (result.providers?.length || 0) + (result.credentials?.length || 0);
          if (total > 0) {
            console.log(`\n  From ${envFile}:`);
            if (result.providers?.length > 0) {
              console.log(`    Providers: ${result.providers.map((p) => p.serviceType).join(", ")}`);
            }
            if (result.credentials?.length > 0) {
              console.log(`    Credentials: ${result.credentials.map((c) => c.serviceType).join(", ")}`);
            }
          }
        } catch {
          console.log(`  Could not parse ${envFile}.`);
        }
      }
      console.log("");
    }
  }

  console.log("  Setup complete!\n");
  console.log("  Next steps:");
  console.log("    openclaw connect <service>  — connect a specific service");
  console.log("    openclaw status             — view all connections");
  console.log("    openclaw status --test      — test all connections\n");
};

module.exports = { run };
