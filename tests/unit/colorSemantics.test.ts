import { describe, expect, it } from "vitest";
import {
  AGENT_STATUS_BADGE_CLASS,
  AGENT_STATUS_LABEL,
  GATEWAY_STATUS_BADGE_CLASS,
  GATEWAY_STATUS_LABEL,
  NEEDS_APPROVAL_BADGE_CLASS,
  resolveAgentStatusBadgeClass,
  resolveAgentStatusLabel,
  resolveGatewayStatusBadgeClass,
  resolveGatewayStatusLabel,
} from "@/features/agents/components/colorSemantics";

describe("colorSemantics", () => {
  it("maps agent statuses to semantic badge classes and i18n label keys", () => {
    expect(AGENT_STATUS_LABEL.idle).toBe("agentIdle");
    expect(AGENT_STATUS_LABEL.running).toBe("agentRunning");
    expect(AGENT_STATUS_LABEL.error).toBe("agentError");

    expect(AGENT_STATUS_BADGE_CLASS.idle).toBe("ui-badge-status-idle");
    expect(AGENT_STATUS_BADGE_CLASS.running).toBe("ui-badge-status-running");
    expect(AGENT_STATUS_BADGE_CLASS.error).toBe("ui-badge-status-error");

    expect(resolveAgentStatusLabel("idle")).toBe("agentIdle");
    expect(resolveAgentStatusBadgeClass("running")).toBe("ui-badge-status-running");
  });

  it("maps gateway statuses to semantic badge classes and i18n label keys", () => {
    expect(GATEWAY_STATUS_LABEL.disconnected).toBe("gatewayDisconnected");
    expect(GATEWAY_STATUS_LABEL.connecting).toBe("gatewayConnecting");
    expect(GATEWAY_STATUS_LABEL.connected).toBe("gatewayConnected");

    expect(GATEWAY_STATUS_BADGE_CLASS.disconnected).toBe("ui-badge-status-disconnected");
    expect(GATEWAY_STATUS_BADGE_CLASS.connecting).toBe("ui-badge-status-connecting");
    expect(GATEWAY_STATUS_BADGE_CLASS.connected).toBe("ui-badge-status-connected");

    expect(resolveGatewayStatusLabel("connected")).toBe("gatewayConnected");
    expect(resolveGatewayStatusBadgeClass("disconnected")).toBe("ui-badge-status-disconnected");
  });

  it("keeps approval state on its own semantic class", () => {
    expect(NEEDS_APPROVAL_BADGE_CLASS).toBe("ui-badge-approval");
  });
});
