import type { AgentState, FocusFilter } from "@/features/agents/state/store";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, MessageSquare, Clock } from "lucide-react";
import { AgentAvatar } from "./AgentAvatar";
import {
  NEEDS_APPROVAL_BADGE_CLASS,
  resolveAgentStatusBadgeClass,
  resolveAgentStatusLabel,
} from "./colorSemantics";
import { EmptyStatePanel } from "./EmptyStatePanel";
import type { AgentChannelLink } from "@/features/routing/agentChannelResolver";

type FleetSidebarProps = {
  agents: AgentState[];
  selectedAgentId: string | null;
  filter: FocusFilter;
  onFilterChange: (next: FocusFilter) => void;
  onSelectAgent: (agentId: string) => void;
  onCreateAgent: () => void;
  createDisabled?: boolean;
  createBusy?: boolean;
  channelsByAgent?: Map<string, AgentChannelLink[]>;
};

const FILTER_KEYS = ["all", "running", "approvals"] as const;

const formatRelativeTime = (timestampMs: number | null): string | null => {
  if (!timestampMs) return null;
  const delta = Date.now() - timestampMs;
  if (delta < 60_000) return "<1m";
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)}m`;
  if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)}h`;
  return `${Math.floor(delta / 86_400_000)}d`;
};

export const FleetSidebar = ({
  agents,
  selectedAgentId,
  filter,
  onFilterChange,
  onSelectAgent,
  onCreateAgent,
  createDisabled = false,
  createBusy = false,
  channelsByAgent,
}: FleetSidebarProps) => {
  const t = useTranslations("fleet");
  const ts = useTranslations("status");
  const [searchQuery, setSearchQuery] = useState("");
  const rowRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const previousTopByAgentIdRef = useRef<Map<string, number>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const filteredBySearch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter((a) => a.name.toLowerCase().includes(q));
  }, [agents, searchQuery]);

  const agentOrderKey = useMemo(
    () => filteredBySearch.map((agent) => agent.agentId).join("|"),
    [filteredBySearch],
  );

  useLayoutEffect(() => {
    const scroller = scrollContainerRef.current;
    if (!scroller) return;
    const scrollerRect = scroller.getBoundingClientRect();

    const getTopInScrollContent = (node: HTMLElement) =>
      node.getBoundingClientRect().top - scrollerRect.top + scroller.scrollTop;

    const nextTopByAgentId = new Map<string, number>();
    const agentIds = agentOrderKey.length === 0 ? [] : agentOrderKey.split("|");
    for (const agentId of agentIds) {
      const node = rowRefs.current.get(agentId);
      if (!node) continue;
      const nextTop = getTopInScrollContent(node);
      nextTopByAgentId.set(agentId, nextTop);
      const previousTop = previousTopByAgentIdRef.current.get(agentId);
      if (typeof previousTop !== "number") continue;
      const deltaY = previousTop - nextTop;
      if (Math.abs(deltaY) < 0.5) continue;
      if (typeof node.animate !== "function") continue;
      node.animate(
        [
          { transform: `translateY(${deltaY}px)` },
          { transform: "translateY(0px)" },
        ],
        { duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
    }
    previousTopByAgentIdRef.current = nextTopByAgentId;
  }, [agentOrderKey]);

  return (
    <aside
      className="glass-panel fade-up-delay ui-panel ui-depth-sidepanel relative flex h-full w-full min-w-72 flex-col gap-3 bg-sidebar p-3 xl:max-w-[320px] xl:border-r xl:border-sidebar-border"
      data-testid="fleet-sidebar"
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <p className="console-title type-page-title text-foreground">
          {t("title", { count: agents.length })}
        </p>
        <button
          type="button"
          data-testid="fleet-new-agent-button"
          className="ui-btn-primary px-3 py-2 font-mono text-[12px] font-medium tracking-[0.02em] disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground"
          onClick={onCreateAgent}
          disabled={createDisabled || createBusy}
        >
          {createBusy ? t("creating") : t("newAgent")}
        </button>
      </div>

      <div className="relative">
        <Search
          className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="text"
          className="ui-input w-full rounded-md py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground"
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchLabel")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-testid="fleet-search-input"
        />
      </div>

      <div className="ui-segment ui-segment-fleet-filter grid-cols-3">
        {FILTER_KEYS.map((key) => {
          const active = filter === key;
          const labels: Record<string, string> = {
            all: t("filterAll"),
            running: t("filterRunning"),
            approvals: t("filterApprovals"),
          };
          return (
            <button
              key={key}
              type="button"
              data-testid={`fleet-filter-${key}`}
              aria-pressed={active}
              className="ui-segment-item px-2 py-1 font-mono text-[12px] font-medium tracking-[0.02em]"
              data-active={active ? "true" : "false"}
              onClick={() => onFilterChange(key as FocusFilter)}
            >
              {labels[key]}
            </button>
          );
        })}
      </div>

      <div
        ref={scrollContainerRef}
        className="ui-scroll min-h-0 flex-1 overflow-auto"
      >
        {filteredBySearch.length === 0 ? (
          <EmptyStatePanel
            title={searchQuery ? t("noSearchResults") : t("noAgents")}
            compact
            className="p-3 text-xs"
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {filteredBySearch.map((agent) => {
              const selected = selectedAgentId === agent.agentId;
              const avatarSeed = agent.avatarSeed ?? agent.agentId;
              return (
                <button
                  key={agent.agentId}
                  ref={(node) => {
                    if (node) {
                      rowRefs.current.set(agent.agentId, node);
                      return;
                    }
                    rowRefs.current.delete(agent.agentId);
                  }}
                  type="button"
                  data-testid={`fleet-agent-row-${agent.agentId}`}
                  className={`group relative ui-card flex w-full items-center gap-3 overflow-hidden border px-3 py-3 text-left transition-colors ${
                    selected ? "ui-card-selected" : "hover:bg-surface-2/45"
                  }`}
                  onClick={() => onSelectAgent(agent.agentId)}
                >
                  <span
                    aria-hidden="true"
                    className={`ui-card-select-indicator ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-35"}`}
                  />
                  <AgentAvatar
                    seed={avatarSeed}
                    name={agent.name}
                    avatarUrl={agent.avatarUrl ?? null}
                    size={42}
                    isSelected={selected}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="type-secondary-heading truncate text-foreground">
                      {agent.name}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className={`ui-badge ${resolveAgentStatusBadgeClass(agent.status)}`}
                        data-status={agent.status}
                      >
                        {ts(resolveAgentStatusLabel(agent.status))}
                      </span>
                      {agent.awaitingUserInput ? (
                        <span
                          className={`ui-badge ${NEEDS_APPROVAL_BADGE_CLASS}`}
                          data-status="approval"
                        >
                          {t("needsApproval")}
                        </span>
                      ) : null}
                      {(channelsByAgent?.get(agent.agentId) ?? []).map(
                        (link) => (
                          <span
                            key={link.channelId}
                            className="ui-badge flex items-center gap-1 bg-surface-2/60 text-foreground/70"
                            title={link.ruleName}
                          >
                            <span className="text-[9px]">
                              {link.channelIcon}
                            </span>
                            <span className="text-[9px]">
                              {link.channelName}
                            </span>
                          </span>
                        ),
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <MessageSquare
                          className="h-2.5 w-2.5"
                          aria-hidden="true"
                        />
                        {agent.outputLines.length}
                      </span>
                      {formatRelativeTime(agent.lastActivityAt) ? (
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" aria-hidden="true" />
                          {formatRelativeTime(agent.lastActivityAt)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
