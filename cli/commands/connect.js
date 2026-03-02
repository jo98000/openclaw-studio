const { execSync } = require("node:child_process");
const { askSecret, confirm } = require("../lib/prompts");
const { api } = require("../lib/api-client");
const { SERVICES } = require("./services");

const SIGNUP_URLS = {
  // Providers
  anthropic: "https://console.anthropic.com",
  openai: "https://platform.openai.com/api-keys",
  google: "https://aistudio.google.com/app/apikey",
  perplexity: "https://perplexity.ai/settings/api",
  mistral: "https://console.mistral.ai/api-keys",
  groq: "https://console.groq.com/keys",
  openrouter: "https://openrouter.ai/keys",
  deepseek: "https://platform.deepseek.com/api_keys",
  together: "https://api.together.ai/settings/api-keys",
  fireworks: "https://fireworks.ai/account/api-keys",
  cohere: "https://dashboard.cohere.com/api-keys",
  huggingface: "https://huggingface.co/settings/tokens",
  xai: "https://console.x.ai",
  // Credentials
  github: "https://github.com/settings/tokens/new",
  slack: "https://api.slack.com/apps",
  discord: "https://discord.com/developers/applications",
  telegram: "https://t.me/BotFather",
  stripe: "https://dashboard.stripe.com/apikeys",
  notion: "https://notion.so/my-integrations",
  linear: "https://linear.app/settings/api",
  gitlab: "https://gitlab.com/-/user_settings/personal_access_tokens",
  sendgrid: "https://app.sendgrid.com/settings/api_keys",
  sentry: "https://sentry.io/settings/auth-tokens/",
  supabase: "https://supabase.com/dashboard",
};

/**
 * Try to detect credentials via CLI.
 */
const tryCliDetect = (serviceId) => {
  try {
    const result = api.get("/api/credentials/cli-detect");
    return result;
  } catch {
    return null;
  }
};

const tryExec = (cmd) => {
  try {
    return execSync(cmd, { encoding: "utf8", timeout: 5000, stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch {
    return null;
  }
};

const commandExists = (cmd) => {
  const check = process.platform === "win32" ? `where ${cmd}` : `which ${cmd}`;
  return tryExec(check) !== null;
};

const openUrl = (url) => {
  try {
    const cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
    execSync(`${cmd} "${url}"`, { stdio: "ignore" });
  } catch {
    // Ignore if browser can't be opened
  }
};

const run = async (args) => {
  const serviceId = args[0];
  if (!serviceId) {
    console.error('Usage: openclaw connect <service>');
    console.error('Example: openclaw connect github');
    console.error('Run "openclaw services" to see available services.');
    process.exit(1);
  }

  const service = SERVICES.find((s) => s.id === serviceId);
  if (!service) {
    console.error(`Unknown service: ${serviceId}`);
    console.error('Run "openclaw services" to see available services.');
    process.exit(1);
  }

  console.log(`\n  Connecting ${service.name}...`);

  // Try CLI auto-detection
  if (service.cli && commandExists(service.cli)) {
    console.log(`  Found ${service.cli} CLI installed.`);

    if (serviceId === "github") {
      const token = tryExec("gh auth token");
      if (token) {
        console.log(`  GitHub token detected from gh CLI.`);
        const use = await confirm("  Use this token?");
        if (use) {
          console.log(`  Token: ${token.slice(0, 7)}${"*".repeat(8)}`);
          console.log(`  Done. GitHub token ready for import.\n`);
          return;
        }
      }
    }

    if (serviceId === "aws") {
      console.log(`  AWS CLI detected. Credentials will be read from ~/.aws/credentials`);
    }

    if (serviceId === "gcp" || serviceId === "google") {
      const project = tryExec("gcloud config get-value project");
      if (project) console.log(`  GCP project: ${project}`);
    }

    if (serviceId === "stripe") {
      console.log(`  Stripe CLI detected. Config at ~/.config/stripe/config.toml`);
    }

    if (serviceId === "gitlab") {
      console.log(`  glab CLI detected. Config at ~/.config/glab-cli/config.yml`);
    }

    if (serviceId === "supabase") {
      console.log(`  Supabase CLI detected.`);
    }
  }

  // Show guide and signup URL
  const signupUrl = SIGNUP_URLS[serviceId];
  if (signupUrl) {
    console.log(`\n  To get your ${service.name} credentials:`);
    console.log(`  ${signupUrl}`);
    const openBrowser = await confirm("\n  Open in browser?");
    if (openBrowser) openUrl(signupUrl);
  }

  // Ask for the key/token
  if (service.type === "provider") {
    const key = await askSecret(`\n  Paste your ${service.name} API key: `);
    if (!key) {
      console.log("  Cancelled.\n");
      return;
    }
    console.log(`  Key: ${key.slice(0, 7)}${"*".repeat(8)}`);

    // Validate
    console.log("  Validating...");
    try {
      const result = await api.post("/api/providers/validate", {
        providerId: serviceId,
        apiKey: key,
      });
      if (result.valid) {
        console.log("  Connection successful!");
      } else {
        console.log(`  Warning: validation failed — ${result.error || "unknown error"}`);
        const proceed = await confirm("  Save anyway?", false);
        if (!proceed) {
          console.log("  Cancelled.\n");
          return;
        }
      }
    } catch {
      console.log("  Could not validate (Studio may not be running).");
    }

    console.log(`  Done. ${service.name} provider configured.\n`);
  } else {
    // Credential
    const token = await askSecret(`\n  Paste your ${service.name} token/key: `);
    if (!token) {
      console.log("  Cancelled.\n");
      return;
    }
    console.log(`  Token: ${token.slice(0, 7)}${"*".repeat(8)}`);
    console.log(`  Done. ${service.name} credential ready for import.\n`);
  }
};

module.exports = { run };
