// Services supported by OpenClaw Studio
const SERVICES = [
  // AI Providers
  { type: "provider", id: "anthropic", name: "Anthropic", cli: null },
  { type: "provider", id: "openai", name: "OpenAI", cli: null },
  { type: "provider", id: "google", name: "Google AI", cli: "gcloud" },
  { type: "provider", id: "perplexity", name: "Perplexity", cli: null },
  { type: "provider", id: "mistral", name: "Mistral", cli: null },
  { type: "provider", id: "groq", name: "Groq", cli: null },
  { type: "provider", id: "openrouter", name: "OpenRouter", cli: null },
  { type: "provider", id: "ollama", name: "Ollama", cli: "ollama" },
  { type: "provider", id: "deepseek", name: "DeepSeek", cli: null },
  { type: "provider", id: "together", name: "Together AI", cli: null },
  { type: "provider", id: "fireworks", name: "Fireworks AI", cli: null },
  { type: "provider", id: "cohere", name: "Cohere", cli: null },
  { type: "provider", id: "amazon-bedrock", name: "Amazon Bedrock", cli: "aws" },
  { type: "provider", id: "azure-openai", name: "Azure OpenAI", cli: "az" },
  { type: "provider", id: "cloudflare", name: "Cloudflare Workers AI", cli: null },
  { type: "provider", id: "nvidia", name: "NVIDIA NIM", cli: null },
  { type: "provider", id: "huggingface", name: "HuggingFace", cli: null },
  { type: "provider", id: "xai", name: "xAI (Grok)", cli: null },
  { type: "provider", id: "litellm", name: "LiteLLM", cli: null },
  // Credentials / External Services
  { type: "credential", id: "github", name: "GitHub", cli: "gh" },
  { type: "credential", id: "slack", name: "Slack", cli: null },
  { type: "credential", id: "discord", name: "Discord", cli: null },
  { type: "credential", id: "telegram", name: "Telegram", cli: null },
  { type: "credential", id: "whatsapp", name: "WhatsApp", cli: null },
  { type: "credential", id: "aws", name: "AWS", cli: "aws" },
  { type: "credential", id: "gcp", name: "Google Cloud", cli: "gcloud" },
  { type: "credential", id: "stripe", name: "Stripe", cli: "stripe" },
  { type: "credential", id: "twilio", name: "Twilio", cli: null },
  { type: "credential", id: "sendgrid", name: "SendGrid", cli: null },
  { type: "credential", id: "notion", name: "Notion", cli: null },
  { type: "credential", id: "linear", name: "Linear", cli: null },
  { type: "credential", id: "jira", name: "Jira", cli: null },
  { type: "credential", id: "gitlab", name: "GitLab", cli: "glab" },
  { type: "credential", id: "hubspot", name: "HubSpot", cli: null },
  { type: "credential", id: "datadog", name: "Datadog", cli: null },
  { type: "credential", id: "sentry", name: "Sentry", cli: "sentry-cli" },
  { type: "credential", id: "firebase", name: "Firebase", cli: "firebase" },
  { type: "credential", id: "supabase", name: "Supabase", cli: "supabase" },
  { type: "credential", id: "twitter", name: "Twitter / X", cli: null },
  { type: "credential", id: "instagram", name: "Instagram", cli: null },
  { type: "credential", id: "smtp", name: "SMTP", cli: null },
  { type: "credential", id: "teams", name: "Microsoft Teams", cli: null },
  { type: "credential", id: "mattermost", name: "Mattermost", cli: null },
];

const run = async () => {
  const providers = SERVICES.filter((s) => s.type === "provider");
  const credentials = SERVICES.filter((s) => s.type === "credential");

  console.log("\n  AI Providers");
  console.log("  " + "-".repeat(50));
  for (const s of providers) {
    const cli = s.cli ? ` (CLI: ${s.cli})` : "";
    console.log(`  ${s.id.padEnd(20)} ${s.name}${cli}`);
  }

  console.log("\n  External Services");
  console.log("  " + "-".repeat(50));
  for (const s of credentials) {
    const cli = s.cli ? ` (CLI: ${s.cli})` : "";
    console.log(`  ${s.id.padEnd(20)} ${s.name}${cli}`);
  }

  console.log(`\n  Total: ${SERVICES.length} services\n`);
};

module.exports = { run, SERVICES };
