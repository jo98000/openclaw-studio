import { loadRoutingConfig } from "./routingStore";
import { getChannelById } from "@/features/channels/channelRegistry";
import type { ChannelDefinition } from "@/features/channels/types";

export type AgentChannelLink = {
  channelId: string;
  channelName: string;
  channelIcon: string;
  channelIconColor: string;
  ruleName: string;
};

/**
 * Returns connected channels for a specific agent by scanning enabled routing
 * rules where `targetAgentId === agentId` and a condition has `type: "channel"`.
 */
export const getChannelsForAgent = (agentId: string): AgentChannelLink[] => {
  const config = loadRoutingConfig();
  const links: AgentChannelLink[] = [];

  for (const rule of config.rules) {
    if (!rule.enabled) continue;
    if (rule.targetAgentId !== agentId) continue;

    for (const condition of rule.conditions) {
      if (condition.type !== "channel") continue;
      const channelId = condition.value.trim();
      if (!channelId) continue;
      const channel: ChannelDefinition | null = getChannelById(channelId);
      links.push({
        channelId,
        channelName: channel?.name ?? channelId,
        channelIcon: channel?.icon ?? "🔗",
        channelIconColor: channel?.iconColor ?? "#888",
        ruleName: rule.name,
      });
    }
  }

  return links;
};

/**
 * Batch resolve: returns a Map of agentId → AgentChannelLink[] for all agents
 * that have at least one connected channel.
 */
export const getChannelsByAgent = (): Map<string, AgentChannelLink[]> => {
  const config = loadRoutingConfig();
  const map = new Map<string, AgentChannelLink[]>();

  for (const rule of config.rules) {
    if (!rule.enabled) continue;
    const agentId = rule.targetAgentId;
    if (!agentId) continue;

    for (const condition of rule.conditions) {
      if (condition.type !== "channel") continue;
      const channelId = condition.value.trim();
      if (!channelId) continue;
      const channel: ChannelDefinition | null = getChannelById(channelId);
      const link: AgentChannelLink = {
        channelId,
        channelName: channel?.name ?? channelId,
        channelIcon: channel?.icon ?? "🔗",
        channelIconColor: channel?.iconColor ?? "#888",
        ruleName: rule.name,
      };
      const existing = map.get(agentId);
      if (existing) {
        existing.push(link);
      } else {
        map.set(agentId, [link]);
      }
    }
  }

  return map;
};
