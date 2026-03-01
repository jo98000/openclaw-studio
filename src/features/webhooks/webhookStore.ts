import type { WebhookConfig } from "./types";

const STORAGE_KEY = "openclaw-studio:webhooks";

export const loadWebhooks = (): WebhookConfig[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WebhookConfig[];
  } catch {
    return [];
  }
};

export const persistWebhooks = (webhooks: WebhookConfig[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(webhooks));
};

export const addWebhook = (webhooks: WebhookConfig[], webhook: WebhookConfig): WebhookConfig[] => [
  ...webhooks,
  webhook,
];

export const updateWebhook = (
  webhooks: WebhookConfig[],
  id: string,
  patch: Partial<WebhookConfig>,
): WebhookConfig[] => webhooks.map((w) => (w.id === id ? { ...w, ...patch } : w));

export const removeWebhook = (webhooks: WebhookConfig[], id: string): WebhookConfig[] =>
  webhooks.filter((w) => w.id !== id);
