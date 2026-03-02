import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import type { AgentState } from "@/features/agents/state/store";
import { AgentBrainPanel } from "@/features/agents/components/AgentInspectPanels";
import type { GatewayClient } from "@/lib/gateway/GatewayClient";
import { withIntl } from "./helpers/intlWrapper";

const createAgent = (
  agentId: string,
  name: string,
  sessionKey: string,
): AgentState => ({
  agentId,
  name,
  sessionKey,
  status: "idle",
  sessionCreated: true,
  awaitingUserInput: false,
  hasUnseenActivity: false,
  outputLines: [],
  lastResult: null,
  lastDiff: null,
  runId: null,
  runStartedAt: null,
  streamText: null,
  thinkingTrace: null,
  latestOverride: null,
  latestOverrideKind: null,
  lastAssistantMessageAt: null,
  lastActivityAt: null,
  latestPreview: null,
  lastUserMessage: null,
  draft: "",
  sessionSettingsSynced: true,
  historyLoadedAt: null,
  historyFetchLimit: null,
  historyFetchedCount: null,
  historyMaybeTruncated: false,
  toolCallingEnabled: true,
  showThinkingTraces: true,
  model: null,
  thinkingLevel: null,
  avatarSeed: `seed-${agentId}`,
  avatarUrl: null,
});

const createMockClient = () => {
  const filesByAgent: Record<string, Record<string, string>> = {
    "agent-1": {
      "DIRECTIVES.md": "alpha agents",
      "PERSONA.md":
        "# PERSONA.md\n\n- Name: Alpha\n- Creature: droid\n- Vibe: calm\n- Emoji: 🤖\n- Avatar: \n\n## Core Truths\n\nBe useful.",
      "USER.md":
        "# USER.md - About Your Human\n\n- Name: George\n- What to call them: GP\n- Pronouns: \n- Timezone: \n- Notes: \n\n## Context\n\nBuilding OpenClaw Studio.",
      "HEARTBEAT.md": "heartbeat notes",
      "MEMORY.md": "durable memory",
    },
    "agent-2": {
      "DIRECTIVES.md": "beta agents",
    },
  };

  const calls: Array<{ method: string; params: unknown }> = [];

  const client = {
    call: vi.fn(async (method: string, params: unknown) => {
      calls.push({ method, params });
      if (method === "agents.files.get") {
        const record =
          params && typeof params === "object"
            ? (params as Record<string, unknown>)
            : {};
        const agentId =
          typeof record.agentId === "string" ? record.agentId : "";
        const name = typeof record.name === "string" ? record.name : "";
        const content = filesByAgent[agentId]?.[name];
        if (typeof content !== "string") {
          return { file: { name, missing: true } };
        }
        return { file: { name, missing: false, content } };
      }
      if (method === "agents.files.set") {
        const record =
          params && typeof params === "object"
            ? (params as Record<string, unknown>)
            : {};
        const agentId =
          typeof record.agentId === "string" ? record.agentId : "";
        const name = typeof record.name === "string" ? record.name : "";
        const content =
          typeof record.content === "string" ? record.content : "";
        if (!filesByAgent[agentId]) {
          filesByAgent[agentId] = {};
        }
        filesByAgent[agentId][name] = content;
        return { ok: true };
      }
      return {};
    }),
  } as unknown as GatewayClient;

  return { client, calls, filesByAgent };
};

/** Switch to expert (markdown) mode by clicking the Expert toggle button. */
const switchToExpertMode = () => {
  fireEvent.click(screen.getByText("Expert"));
};

describe("AgentBrainPanel", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders structured/expert toggle and structured view by default", async () => {
    const { client } = createMockClient();
    const agents = [
      createAgent("agent-1", "Alpha", "session-1"),
      createAgent("agent-2", "Beta", "session-2"),
    ];

    render(
      withIntl(
        createElement(AgentBrainPanel, {
          client,
          agents,
          selectedAgentId: "agent-1",
        }),
      ),
    );

    await waitFor(() => {
      expect(screen.getByText("Structured")).toBeInTheDocument();
    });

    expect(screen.getByText("Expert")).toBeInTheDocument();
    // Structured mode is active by default
    expect(screen.getByText("Structured").closest("button")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("shows_actionable_message_when_session_key_missing", async () => {
    const { client } = createMockClient();
    const agents = [createAgent("", "Alpha", "session-1")];

    render(
      withIntl(
        createElement(AgentBrainPanel, {
          client,
          agents,
          selectedAgentId: "",
        }),
      ),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Agent ID is missing for this agent."),
      ).toBeInTheDocument();
    });
  });

  it("switches to expert mode and shows markdown editors", async () => {
    const { client } = createMockClient();
    const agents = [createAgent("agent-1", "Alpha", "session-1")];

    render(
      withIntl(
        createElement(AgentBrainPanel, {
          client,
          agents,
          selectedAgentId: "agent-1",
        }),
      ),
    );

    await waitFor(() => {
      expect(screen.getByText("Expert")).toBeInTheDocument();
    });

    switchToExpertMode();

    // Expert mode shows markdown file labels
    await waitFor(() => {
      expect(screen.getByText("PERSONA.md")).toBeInTheDocument();
    });
    expect(screen.getByText("DIRECTIVES.md")).toBeInTheDocument();
    expect(screen.getByText("USER.md")).toBeInTheDocument();
  });

  it("saves_updated_behavior_files_in_expert_mode", async () => {
    const { client, calls, filesByAgent } = createMockClient();
    const agents = [createAgent("agent-1", "Alpha", "session-1")];

    render(
      withIntl(
        createElement(AgentBrainPanel, {
          client,
          agents,
          selectedAgentId: "agent-1",
        }),
      ),
    );

    await waitFor(() => {
      expect(screen.getByText("Expert")).toBeInTheDocument();
    });

    switchToExpertMode();

    await waitFor(() => {
      expect(screen.getByText("DIRECTIVES.md")).toBeInTheDocument();
    });

    // The expert mode shows textareas — find the directives one by its placeholder
    const textareas = screen.getAllByRole("textbox");
    // Find the textarea that contains "alpha agents"
    const directivesTextarea = textareas.find(
      (ta) => (ta as HTMLTextAreaElement).value === "alpha agents",
    );
    expect(directivesTextarea).toBeDefined();

    fireEvent.change(directivesTextarea!, {
      target: { value: "alpha directives updated" },
    });

    const saveButton = screen.getByRole("button", { name: "Save" });
    expect(saveButton).not.toBeDisabled();
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(calls.some((entry) => entry.method === "agents.files.set")).toBe(
        true,
      );
    });
    expect(filesByAgent["agent-1"]["DIRECTIVES.md"]).toBe(
      "alpha directives updated",
    );
  });

  it("discards_unsaved_changes_without_writing_files", async () => {
    const { client, calls } = createMockClient();
    const agents = [createAgent("agent-1", "Alpha", "session-1")];

    render(
      withIntl(
        createElement(AgentBrainPanel, {
          client,
          agents,
          selectedAgentId: "agent-1",
        }),
      ),
    );

    await waitFor(() => {
      expect(screen.getByText("Expert")).toBeInTheDocument();
    });

    switchToExpertMode();

    await waitFor(() => {
      expect(screen.getByText("PERSONA.md")).toBeInTheDocument();
    });

    const textareas = screen.getAllByRole("textbox");
    const personaTextarea = textareas.find((ta) =>
      (ta as HTMLTextAreaElement).value.includes("# PERSONA.md"),
    );
    expect(personaTextarea).toBeDefined();

    fireEvent.change(personaTextarea!, {
      target: { value: "completely rewritten" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Discard" }));

    await waitFor(() => {
      const updatedTextareas = screen.getAllByRole("textbox");
      const restored = updatedTextareas.find((ta) =>
        (ta as HTMLTextAreaElement).value.includes("# PERSONA.md"),
      );
      expect(restored).toBeDefined();
    });

    expect(calls.some((entry) => entry.method === "agents.files.set")).toBe(
      false,
    );
  });
});
