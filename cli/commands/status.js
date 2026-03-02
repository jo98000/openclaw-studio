const { api } = require("../lib/api-client");

const run = async (args) => {
  const shouldTest = args.includes("--test");

  console.log("\n  OpenClaw Studio — Connection Status\n");

  // Try to detect existing CLI credentials
  let cliCredentials = [];
  try {
    const result = await api.get("/api/credentials/cli-detect");
    cliCredentials = result.detected || [];
  } catch {
    console.log("  Could not connect to Studio. Make sure it is running.");
    console.log("  You can start it with: npm run dev\n");
    return;
  }

  if (cliCredentials.length > 0) {
    console.log(`  CLI Credentials (${cliCredentials.length}):`);
    console.log("  " + "-".repeat(50));
    for (const d of cliCredentials) {
      const status = "detected";
      console.log(`  ${d.serviceType.padEnd(15)} ${d.source.padEnd(25)} ${status}`);
    }
    console.log("");
  } else {
    console.log("  No CLI credentials detected.\n");
  }

  if (shouldTest) {
    console.log("  Testing connections...\n");

    // Build a list of providers to test from CLI detections
    // In a full implementation, this would also test saved provider configs
    const testItems = [];

    // Test any detected CLI credentials that have tokens
    for (const d of cliCredentials) {
      const tokenField = d.fields.find((f) => f.sensitive && f.value);
      if (tokenField) {
        testItems.push({
          serviceType: d.serviceType,
          source: d.source,
          hasToken: true,
        });
      }
    }

    if (testItems.length === 0) {
      console.log("  No credentials available to test.\n");
    } else {
      for (const item of testItems) {
        process.stdout.write(`  Testing ${item.serviceType}... `);
        // For now, just report as detected (real validation would call the validate endpoint)
        console.log("detected");
      }
      console.log("");
    }
  }

  console.log("  Tip: Use 'openclaw connect <service>' to add new connections.\n");
};

module.exports = { run };
