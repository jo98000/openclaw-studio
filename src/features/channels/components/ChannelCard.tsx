"use client";

import type { ChannelWithStatus } from "../types";
import { ChannelStatusBadge } from "./ChannelStatusBadge";

type ChannelCardProps = {
  channel: ChannelWithStatus;
  onConfigure: (id: string) => void;
};

export const ChannelCard = ({ channel, onConfigure }: ChannelCardProps) => (
  <button
    type="button"
    onClick={() => onConfigure(channel.id)}
    className="ui-card flex items-center gap-3 p-3 text-left transition-colors hover:bg-surface-2"
    data-testid={`channel-card-${channel.id}`}
  >
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg"
      style={{ backgroundColor: `${channel.iconColor}18` }}
    >
      {channel.icon}
    </span>
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <span className="truncate text-sm font-medium text-foreground">{channel.name}</span>
        <ChannelStatusBadge status={channel.status} />
      </div>
      <p className="truncate text-[11px] text-muted-foreground">{channel.description}</p>
    </div>
  </button>
);
