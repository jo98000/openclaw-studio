export type ProviderId =
  | "anthropic"
  | "openai"
  | "perplexity"
  | "google"
  | "mistral"
  | "groq"
  | "openrouter"
  | "ollama"
  | "deepseek"
  | "together"
  | "fireworks"
  | "cohere"
  | "amazon-bedrock"
  | "azure-openai"
  | "cloudflare"
  | "nvidia"
  | "huggingface"
  | "xai"
  | "litellm"
  | "custom";

export type ProviderAuthType = "apiKey" | "accessToken";

export type ProviderStatus = "configured" | "unconfigured" | "error";

export type ProviderConfig = {
  id: ProviderId;
  apiKey?: string;
  accessToken?: string;
  authType: ProviderAuthType;
  baseUrl?: string;
  enabled: boolean;
};

export type ProviderDefinition = {
  id: ProviderId;
  name: string;
  description: string;
  docsUrl: string;
  iconColor: string;
  models: ProviderModelInfo[];
  supportsCustomEndpoint: boolean;
  supportsAccessToken: boolean;
  signupUrl?: string;
  guideSteps?: string[];
};

export type ProviderModelInfo = {
  id: string;
  name: string;
  category: "reasoning" | "general" | "search" | "code" | "multimodal" | "fast";
  contextWindow: number;
  costTier: "low" | "mid" | "high";
  badges: string[];
};

export type ProviderWithStatus = ProviderDefinition & {
  status: ProviderStatus;
  config?: ProviderConfig;
};
