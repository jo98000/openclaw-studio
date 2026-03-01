import type { ChannelConfig, ChannelWithStatus } from "./types";
import { CHANNEL_REGISTRY } from "./channelRegistry";

const STORAGE_KEY = "openclaw-studio-channels";

export function loadChannelConfigs(): Record<string, ChannelConfig> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ChannelConfig>;
  } catch {
    return {};
  }
}

export function persistChannelConfigs(configs: Record<string, ChannelConfig>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  } catch {
    // localStorage may be unavailable
  }
}

export function buildChannelsWithStatus(
  configs: Record<string, ChannelConfig>,
): ChannelWithStatus[] {
  return CHANNEL_REGISTRY.map((def) => {
    const config = configs[def.id];
    let status: ChannelWithStatus["status"] = "disconnected";
    if (config?.enabled) {
      status = "connected";
    } else if (config) {
      status = "configuring";
    }
    return { ...def, status, config };
  });
}
