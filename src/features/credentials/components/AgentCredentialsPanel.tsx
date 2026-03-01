"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { KeyRound, Plus } from "lucide-react";
import type { CredentialEntry } from "../types";
import { loadAgentCredentials, persistAgentCredentials } from "../credentialStore";
import { CredentialCard } from "./CredentialCard";
import { CredentialEditModal } from "./CredentialEditModal";

type AgentCredentialsPanelProps = {
  agentId: string;
};

export const AgentCredentialsPanel = ({ agentId }: AgentCredentialsPanelProps) => {
  const t = useTranslations("credentials");
  const [entries, setEntries] = useState<CredentialEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<CredentialEntry | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setEntries(loadAgentCredentials(agentId));
  }, [agentId]);

  const persist = useCallback(
    (next: CredentialEntry[]) => {
      setEntries(next);
      persistAgentCredentials(agentId, next);
    },
    [agentId],
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

  return (
    <section className="sidebar-section" data-testid="agent-credentials-panel">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{t("description")}</p>
        </div>
        <button
          type="button"
          className="ui-btn-primary inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] font-medium"
          onClick={handleAdd}
          data-testid="add-credential-btn"
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
          {t("addCredential")}
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-10 text-center">
          <KeyRound className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("noCredentials")}</p>
            <p className="mt-1 text-[11px] text-muted-foreground/70">{t("noCredentialsHint")}</p>
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
