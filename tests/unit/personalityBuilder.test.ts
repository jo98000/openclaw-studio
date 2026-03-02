import { describe, expect, it } from "vitest";

import { createAgentFilesState } from "@/lib/agents/agentFiles";
import {
  parsePersonalityFiles,
  serializePersonalityFiles,
  type PersonalityBuilderDraft,
} from "@/lib/agents/personalityBuilder";

const createFiles = () => createAgentFilesState();

describe("personalityBuilder", () => {
  it("parsePersonaMarkdown_extracts_fields_from_template_style_list", () => {
    const files = createFiles();
    files["PERSONA.md"] = {
      exists: true,
      content: `# PERSONA.md\n\n- Name: Nova\n- Creature: fox spirit\n- Vibe: calm + direct\n- Emoji: 🦊\n- Avatar: avatars/nova.png\n`,
    };

    const draft = parsePersonalityFiles(files);

    expect(draft.persona).toEqual({
      name: "Nova",
      creature: "fox spirit",
      vibe: "calm + direct",
      emoji: "🦊",
      avatar: "avatars/nova.png",
      coreTruths: "",
      boundaries: "",
      continuity: "",
      traits: draft.persona.traits,
    });
  });

  it("parseUserMarkdown_extracts_context_block_and_profile_fields", () => {
    const files = createFiles();
    files["USER.md"] = {
      exists: true,
      content: `# USER.md - About Your Human\n\n- **Name:** George\n- **What to call them:** GP\n- **Pronouns:** he/him\n- **Timezone:** America/Chicago\n- **Notes:** Building OpenClaw Studio.\n\n## Context\n\nWants concise technical answers.\nPrefers implementation over discussion.\n`,
    };

    const draft = parsePersonalityFiles(files);

    expect(draft.user).toEqual({
      name: "George",
      callThem: "GP",
      pronouns: "he/him",
      timezone: "America/Chicago",
      notes: "Building OpenClaw Studio.",
      context:
        "Wants concise technical answers.\nPrefers implementation over discussion.",
    });
  });

  it("parsePersonaMarkdown_extracts_soul_sections", () => {
    const files = createFiles();
    files["PERSONA.md"] = {
      exists: true,
      content: `# PERSONA.md\n\n- Name: Nova\n- Creature: fox\n- Vibe: calm\n- Emoji: 🦊\n- Avatar: avatar.png\n\n## Core Truths\n\nBe direct.\nAvoid filler.\n\n## Boundaries\n\n- Keep user data private.\n\n## Continuity\n\nUpdate files when behavior changes.\n`,
    };

    const draft = parsePersonalityFiles(files);

    expect(draft.persona.coreTruths).toBe("Be direct.\nAvoid filler.");
    expect(draft.persona.boundaries).toBe("- Keep user data private.");
    expect(draft.persona.continuity).toBe(
      "Update files when behavior changes.",
    );
  });

  it("ignores_template_placeholders_for_persona_and_user", () => {
    const files = createFiles();
    files["PERSONA.md"] = {
      exists: true,
      content:
        "# PERSONA.md\n\n- Name: (pick something you like)\n- Creature: (AI? robot? familiar? ghost in the machine? something weirder?)\n- Vibe: (how do you come across? sharp? warm? chaotic? calm?)\n- Emoji: (your signature — pick one that feels right)\n- Avatar: (workspace-relative path, http(s) URL, or data URI)\n",
    };
    files["USER.md"] = {
      exists: true,
      content:
        "# USER.md - About Your Human\n\n- Name:\n- What to call them:\n- Pronouns: (optional)\n- Timezone:\n- Notes:\n\n## Context\n\n(What do they care about? What projects are they working on? What annoys them? What makes them laugh? Build this over time.)\n",
    };

    const draft = parsePersonalityFiles(files);

    expect(draft.persona.name).toBe("");
    expect(draft.persona.creature).toBe("");
    expect(draft.persona.vibe).toBe("");
    expect(draft.persona.emoji).toBe("");
    expect(draft.persona.avatar).toBe("");
    expect(draft.user.name).toBe("");
    expect(draft.user.callThem).toBe("");
    expect(draft.user.pronouns).toBe("");
    expect(draft.user.timezone).toBe("");
    expect(draft.user.notes).toBe("");
    expect(draft.user.context).toBe("");
  });

  it("serializePersonalityFiles_emits_stable_markdown_for_persona_directives_user", () => {
    const draft: PersonalityBuilderDraft = {
      persona: {
        name: "Nova",
        creature: "fox spirit",
        vibe: "calm + direct",
        emoji: "🦊",
        avatar: "avatars/nova.png",
        coreTruths: "Be direct.\nAvoid filler.",
        boundaries: "- Keep user data private.",
        continuity: "Update files when behavior changes.",
        traits: {
          formality: 70,
          verbosity: 50,
          creativity: 60,
          proactivity: 40,
          warmth: 80,
        },
      },
      directives: {
        mission: "Top-level mission.",
        rules: "Operating rules.",
        priorities: "Priority guidelines.",
        outputFormat: "Output format specs.",
        toolNotes: "Tool conventions.",
      },
      user: {
        name: "George",
        callThem: "GP",
        pronouns: "he/him",
        timezone: "America/Chicago",
        notes: "Building OpenClaw Studio.",
        context:
          "Wants concise technical answers.\nPrefers implementation over discussion.",
      },
      heartbeat: "Heartbeat notes.",
      memory: "Durable memory.",
    };

    const files = serializePersonalityFiles(draft);

    expect(files["PERSONA.md"]).toContain("# PERSONA.md");
    expect(files["PERSONA.md"]).toContain("- Name: Nova");
    expect(files["PERSONA.md"]).toContain("- Creature: fox spirit");
    expect(files["PERSONA.md"]).toContain("## Core Truths");
    expect(files["PERSONA.md"]).toContain("Be direct.");
    expect(files["PERSONA.md"]).toContain("## Boundaries");
    expect(files["PERSONA.md"]).toContain("## Continuity");

    expect(files["DIRECTIVES.md"]).toContain("# DIRECTIVES.md");
    expect(files["DIRECTIVES.md"]).toContain("## Mission");
    expect(files["DIRECTIVES.md"]).toContain("## Rules");
    expect(files["DIRECTIVES.md"]).toContain("## Priorities");
    expect(files["DIRECTIVES.md"]).toContain("## Output Format");
    expect(files["DIRECTIVES.md"]).toContain("## Tool Notes");

    expect(files["USER.md"]).toBe(
      [
        "# USER.md - About Your Human",
        "",
        "- Name: George",
        "- What to call them: GP",
        "- Pronouns: he/him",
        "- Timezone: America/Chicago",
        "- Notes: Building OpenClaw Studio.",
        "",
        "## Context",
        "",
        "Wants concise technical answers.",
        "Prefers implementation over discussion.",
        "",
      ].join("\n"),
    );

    expect(files["HEARTBEAT.md"]).toBe("Heartbeat notes.");
    expect(files["MEMORY.md"]).toBe("Durable memory.");
  });
});
