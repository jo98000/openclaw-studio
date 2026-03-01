export type ProviderId =
  | "anthropic"
  | "openai"
  | "perplexity"
  | "google"
  | "mistral"
  | "custom";

export type ProviderStatus = "configured" | "unconfigured" | "error";

export type ProviderConfig = {
  id: ProviderId;
  apiKey: string;
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
