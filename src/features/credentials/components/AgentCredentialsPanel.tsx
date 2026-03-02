"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { KeyRound, Plus, Loader2, Terminal } from "lucide-react";
import { toast } from "sonner";
import type { CredentialEntry, CredentialField } from "../types";
import {
  loadAgentCredentials,
  persistAgentCredentials,
} from "../credentialStore";
import { allCredentialsToEnvVars } from "../credentialEnvMapping";
import { syncCredentialEnvToGateway } from "@/lib/gateway/credentialSandboxSync";
import { detectCliCredentials } from "../cliDetectApi";
import type { GatewayClient } from "@/lib/gateway/GatewayClient";
import { randomUUID } from "@/lib/uuid";
import { CredentialCard } from "./CredentialCard";
import { CredentialEditModal } from "./CredentialEditModal";

type AgentCredentialsPanelProps = {
  agentId: string;
  gatewayClient?: GatewayClient | null;
};

/**
 * Compute all env var keys currently produced by the given credential entries.
 */
const collectEnvKeys = (entries: CredentialEntry[]): Set<string> => {
  const envVars = allCredentialsToEnvVars(entries);
  return new Set(Object.keys(envVars));
};

export const AgentCredentialsPanel = ({
  agentId,
  gatewayClient,
}: AgentCredentialsPanelProps) => {
  const t = useTranslations("credentials");
  const tc = useTranslations("common");
  const [entries, setEntries] = useState<CredentialEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<CredentialEntry | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const previousEnvKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadAgentCredentials(agentId).then((loaded) => {
      if (!cancelled) {
        setEntries(loaded);
        previousEnvKeysRef.current = collectEnvKeys(loaded);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  const syncToGateway = useCallback(
    (nextEntries: CredentialEntry[]) => {
      if (!gatewayClient) return;
      const envVars = allCredentialsToEnvVars(nextEntries);
      const previousKeys = previousEnvKeysRef.current;
      previousEnvKeysRef.current = new Set(Object.keys(envVars));
      syncCredentialEnvToGateway({
        client: gatewayClient,
        agentId,
        credentialEnvVars: envVars,
        previousCredentialKeys: previousKeys,
      }).catch((err) => {
        console.warn("Failed to sync credential env vars to gateway.", err);
      });
    },
    [agentId, gatewayClient],
  );

  const persist = useCallback(
    (next: CredentialEntry[]) => {
      setEntries(next);
      persistAgentCredentials(agentId, next);
      syncToGateway(next);
    },
    [agentId, syncToGateway],
  );

  const handleSave = useCallback(
    (entry: CredentialEntry) => {
      const exists = entries.some((e) => e.id === entry.id);
      const next = exists
        ? entries.map((e) => (e.id === entry.id ? entry : e))
        : [...entries, entry];
      persist(next);
      setShowModal(false);
      setEditingEntry(null);
    },
    [entries, persist],
  );

  const handleDelete = useCallback(
    (id: string) => {
      persist(entries.filter((e) => e.id !== id));
    },
    [entries, persist],
  );

  const handleEdit = useCallback((entry: CredentialEntry) => {
    setEditingEntry(entry);
    setShowModal(true);
  }, []);

  const handleAdd = useCallback(() => {
    setEditingEntry(null);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingEntry(null);
  }, []);

  const [cliDetecting, setCliDetecting] = useState(false);

  const handleCliDetect = useCallback(async () => {
    setCliDetecting(true);
    try {
      const detected = await detectCliCredentials();
      if (detected.length === 0) {
        toast.info(t("cliNoneDetected"));
        return;
      }
      const now = Date.now();
      const newEntries: CredentialEntry[] = detected.map((d) => ({
        id: randomUUID(),
        label: `${d.serviceType} (${d.source})`,
        serviceType: d.serviceType as CredentialEntry["serviceType"],
        fields: d.fields as CredentialField[],
        createdAt: now,
        updatedAt: now,
      }));
      const merged = [...entries];
      for (const ne of newEntries) {
        const existIdx = merged.findIndex(
          (e) => e.serviceType === ne.serviceType,
        );
        if (existIdx >= 0) {
          merged[existIdx] = {
            ...merged[existIdx],
            fields: ne.fields,
            updatedAt: now,
          };
        } else {
          merged.push(ne);
        }
      }
      persist(merged);
      toast.success(t("cliDetected", { count: detected.length }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "CLI detection failed");
    } finally {
      setCliDetecting(false);
    }
  }, [entries, persist, t]);

  return (
    <section className="sidebar-section" data-testid="agent-credentials-panel">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("title")}
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <button
          type="button"
          className="ui-btn-primary inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] font-medium"
          onClick={handleAdd}
          disabled={loading}
          data-testid="add-credential-btn"
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
          {t("addCredential")}
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-surface-2 disabled:opacity-50"
          onClick={handleCliDetect}
          disabled={loading || cliDetecting}
        >
          {cliDetecting ? (
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          ) : (
            <Terminal className="h-3 w-3" aria-hidden="true" />
          )}
          {cliDetecting ? t("cliDetecting") : t("importFromCli")}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-xs text-muted-foreground">
            {tc("loading")}
          </span>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-10 text-center">
          <KeyRound
            className="h-8 w-8 text-muted-foreground/40"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t("noCredentials")}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground/70">
              {t("noCredentialsHint")}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {entries.map((entry) => (
            <CredentialCard
              key={entry.id}
              entry={entry}
              onEdit={() => handleEdit(entry)}
              onDelete={() => handleDelete(entry.id)}
            />
          ))}
        </div>
      )}

      {showModal ? (
        <CredentialEditModal
          existingEntry={editingEntry ?? undefined}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      ) : null}
    </section>
  );
};
