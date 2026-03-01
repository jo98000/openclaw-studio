"use client";

import type { ChannelStatus } from "../types";

const STATUS_CLASSES: Record<ChannelStatus, string> = {
  connected: "ui-badge-status-connected",
  disconnected: "ui-badge-status-disconnected",
  error: "ui-badge-status-error",
  configuring: "ui-badge-status-connecting",
};

const STATUS_LABELS: Record<ChannelStatus, string> = {
  connected: "Connected",
  disconnected: "Not configured",
  error: "Error",
  configuring: "Configured",
};

export const ChannelStatusBadge = ({ status }: { status: ChannelStatus }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_CLASSES[status]}`}>
    {STATUS_LABELS[status]}
  </span>
);
