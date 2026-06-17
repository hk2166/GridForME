"use client";

import { useCallback, useEffect, useState } from "react";

export type UserProfile = {
  id: string;
  name: string;
  color: string;
};

const STORAGE_KEY = "gridwars:user";

// Helper: safely read from localStorage
// Wrapped in try/catch because localStorage can be disabled,
// or the stored JSON might be corrupted.
function loadUser(): UserProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Validate shape — don't trust localStorage blindly
    if (parsed && parsed.id && parsed.name && parsed.color) {
      return parsed as UserProfile;
    }

    return null;
  } catch {
    return null;
  }
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Read from localStorage on mount (browser only)
  useEffect(() => {
    const saved = loadUser();
    if (saved) {
      setUser(saved);
    }
    setIsReady(true);
  }, []);

  // Save user to localStorage + state
  const saveUser = useCallback((name: string, color: string) => {
    const existing = loadUser();

    const profile: UserProfile = {
      id: existing?.id ?? crypto.randomUUID(),
      name,
      color,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setUser(profile);
  }, []);

  // Clear user (for "change identity" flow)
  const clearUser = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return { user, isReady, saveUser, clearUser };
}
