export type WebhookId = string;

export type WebhookEvent =
  | "agent.started"
  | "agent.stopped"
  | "agent.error"
  | "message.received"
  | "message.sent"
  | "approval.requested"
  | "approval.resolved"
  | "session.created"
  | "session.ended";

export type WebhookConfig = {
  id: WebhookId;
  name: string;
  url: string;
  secret?: string;
  events: WebhookEvent[];
  enabled: boolean;
  createdAt: string;
};
