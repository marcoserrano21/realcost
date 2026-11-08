"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORE_EVENT = "realcost:store";

type CacheEntry = { key: string; value: unknown };
const caches = new Map<string, CacheEntry>();

function subscribeToStore(id: string, onChange: () => void) {
  const handler = () => {
    caches.delete(id);
    onChange();
  };
  window.addEventListener(STORE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(STORE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

/**
 * Read a localStorage-backed value without copying it into state.
 * `serverValue` must be a stable reference; it is what the server and the
 * hydration render see. `readRaw` is the cache key, so an unchanged store
 * returns the same snapshot.
 */
export function useClientSnapshot<TClient, TServer = TClient>(
  id: string,
  readRaw: () => string,
  read: () => TClient,
  serverValue: TServer
): TClient | TServer {
  const subscribe = useCallback((onChange: () => void) => subscribeToStore(id, onChange), [id]);
  const getSnapshot = useCallback(() => {
    const raw = readRaw();
    const hit = caches.get(id);
    if (hit && hit.key === raw) return hit.value as TClient;
    const value = read();
    caches.set(id, { key: raw, value });
    return value;
  }, [id, readRaw, read]);

  return useSyncExternalStore(
    subscribe,
    getSnapshot as () => TClient | TServer,
    () => serverValue
  );
}
