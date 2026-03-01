"use client";

import { useState, useCallback, useMemo, type ReactNode } from "react";
import type { ProviderId, ProviderConfig, ProviderWithStatus } from "./types";
import {
  ProviderStoreContext,
  loadProviderConfigs,
  persistProviderConfigs,
  buildProvidersWithStatus,
  getConfiguredProviderIdsFromConfigs,
} from "./providerStore";

export const ProviderStoreProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [configs, setConfigs] =
    useState<Record<string, ProviderConfig>>(loadProviderConfigs);

  const saveProvider = useCallback((config: ProviderConfig) => {
    setConfigs((prev) => {
      const next = { ...prev, [config.id]: config };
      persistProviderConfigs(next);
      return next;
    });
  }, []);

  const removeProvider = useCallback((id: ProviderId) => {
    setConfigs((prev) => {
      const next = { ...prev };
      delete next[id];
      persistProviderConfigs(next);
      return next;
    });
  }, []);

  const getProvidersWithStatus = useCallback(
    (): ProviderWithStatus[] => buildProvidersWithStatus(configs),
    [configs],
  );

  const getConfiguredProviderIds = useCallback(
    (): ProviderId[] => getConfiguredProviderIdsFromConfigs(configs),
    [configs],
  );

  const store = useMemo(
    () => ({
      configs,
      saveProvider,
      removeProvider,
      getProvidersWithStatus,
      getConfiguredProviderIds,
    }),
    [
      configs,
      saveProvider,
      removeProvider,
      getProvidersWithStatus,
      getConfiguredProviderIds,
    ],
  );

  return (
    <ProviderStoreContext.Provider value={store}>
      {children}
    </ProviderStoreContext.Provider>
  );
};
