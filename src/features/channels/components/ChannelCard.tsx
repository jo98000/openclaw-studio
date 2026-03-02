"use client";

import type { ChannelWithStatus } from "../types";
import { ChannelStatusBadge } from "./ChannelStatusBadge";
import { ServiceLogo } from "@/components/ServiceLogo";

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
    <ServiceLogo
      serviceId={channel.id}
      name={channel.name}
      fallbackColor={channel.iconColor}
      size={36}
    />
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <span className="truncate text-sm font-medium text-foreground">
          {channel.name}
        </span>
        <ChannelStatusBadge status={channel.status} />
      </div>
      <p className="truncate text-[11px] text-muted-foreground">
        {channel.description}
      </p>
    </div>
  </button>
);
