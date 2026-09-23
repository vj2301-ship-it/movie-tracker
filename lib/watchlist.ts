"use client";

import { useSyncExternalStore } from "react";

export interface SavedMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  addedAt: string;
}

const KEY = "watchlist:v1";
const EMPTY: SavedMovie[] = [];
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedList: SavedMovie[] = EMPTY;

function read(): SavedMovie[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return cachedList; // storage blocked (private mode etc.): keep in-memory list
  }
  if (raw === cachedRaw) return cachedList;
  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cachedList = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    cachedList = EMPTY;
  }
  return cachedList;
}

function write(list: SavedMovie[]) {
  cachedList = list;
  cachedRaw = JSON.stringify(list);
  try {
    localStorage.setItem(KEY, cachedRaw);
  } catch {
    // storage full or blocked: the list still works for this visit
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // keep other open tabs in sync
  const onStorage = (e: StorageEvent) => e.key === KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useWatchlist() {
  const list = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    list,
    has: (id: number) => list.some((m) => m.id === id),
    toggle(movie: Omit<SavedMovie, "addedAt">) {
      const current = read();
      write(
        current.some((m) => m.id === movie.id)
          ? current.filter((m) => m.id !== movie.id)
          : [...current, { ...movie, addedAt: new Date().toISOString() }],
      );
    },
    remove(id: number) {
      write(read().filter((m) => m.id !== id));
    },
  };
}
