import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface ChangeItem {
  id: string;
  timestamp: string;
  action: string;
}

interface ChangeTrackingContextType {
  hasChanges: boolean;
  changeCount: number;
  lastChangedAt: Date | null;
  lastSavedAt: Date | null;
  changes: ChangeItem[];
  markChanged: (action?: string) => void;
  resetChanges: () => void;
  skipEmailIfNoChanges: boolean;
  setSkipEmailIfNoChanges: (skip: boolean) => void;
  closePreferenceMode: "ask" | "auto";
  setClosePreferenceMode: (mode: "ask" | "auto") => void;
  closePreferenceActions: string[];
  setClosePreferenceActions: (actions: string[]) => void;
}

const ChangeTrackingContext = createContext<
  ChangeTrackingContextType | undefined
>(undefined);

// Standalone event listeners for non-React code (like db-client.ts)
type ChangeListener = (action: string) => void;
const externalChangeListeners = new Set<ChangeListener>();

export function notifyDataChanged(action: string = "Veri güncellendi") {
  externalChangeListeners.forEach((fn) => fn(action));
}

const CLOSE_MODE_STORAGE_KEY = "venue_keeper_close_mode";
const CLOSE_ACTIONS_STORAGE_KEY = "venue_keeper_close_actions";
const SKIP_EMAIL_NO_CHANGES_KEY = "venue_keeper_skip_email_no_changes";

export const ChangeTrackingProvider: React.FC<{ children: React.ReactNode }> = (
  { children },
) => {
  const [hasChanges, setHasChanges] = useState<boolean>(() => {
    return sessionStorage.getItem("venue_keeper_has_changes") === "true";
  });
  const [changeCount, setChangeCount] = useState<number>(() => {
    return Number(sessionStorage.getItem("venue_keeper_change_count") || "0");
  });
  const [lastChangedAt, setLastChangedAt] = useState<Date | null>(() => {
    const saved = sessionStorage.getItem("venue_keeper_last_changed");
    return saved ? new Date(saved) : null;
  });
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(() => {
    const saved = localStorage.getItem("venue_keeper_last_saved");
    return saved ? new Date(saved) : null;
  });
  const [changes, setChanges] = useState<ChangeItem[]>([]);

  // Close Preferences
  const [closePreferenceMode, setClosePreferenceModeState] = useState<
    "ask" | "auto"
  >(() => {
    return (localStorage.getItem(CLOSE_MODE_STORAGE_KEY) as "ask" | "auto") ||
      "ask";
  });
  const [closePreferenceActions, setClosePreferenceActionsState] = useState<
    string[]
  >(() => {
    const saved = localStorage.getItem(CLOSE_ACTIONS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return ["backup", "email"];
  });
  const [skipEmailIfNoChanges, setSkipEmailIfNoChangesState] = useState<
    boolean
  >(() => {
    const saved = localStorage.getItem(SKIP_EMAIL_NO_CHANGES_KEY);
    return saved === null ? true : saved === "true"; // Default is TRUE (protect against spam)
  });

  const markChanged = useCallback((action: string = "Kayıt Değişikliği") => {
    const now = new Date();
    setHasChanges(true);
    setChangeCount((prev) => {
      const next = prev + 1;
      sessionStorage.setItem("venue_keeper_change_count", String(next));
      return next;
    });
    setLastChangedAt(now);
    sessionStorage.setItem("venue_keeper_has_changes", "true");
    sessionStorage.setItem("venue_keeper_last_changed", now.toISOString());

    setChanges((prev) => [
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: now.toLocaleTimeString("tr-TR"),
        action,
      },
      ...prev.slice(0, 19),
    ]);
  }, []);

  const resetChanges = useCallback(() => {
    const now = new Date();
    setHasChanges(false);
    setChangeCount(0);
    setLastSavedAt(now);
    setChanges([]);
    sessionStorage.setItem("venue_keeper_has_changes", "false");
    sessionStorage.setItem("venue_keeper_change_count", "0");
    localStorage.setItem("venue_keeper_last_saved", now.toISOString());
  }, []);

  const setClosePreferenceMode = (mode: "ask" | "auto") => {
    setClosePreferenceModeState(mode);
    localStorage.setItem(CLOSE_MODE_STORAGE_KEY, mode);
  };

  const setClosePreferenceActions = (actions: string[]) => {
    setClosePreferenceActionsState(actions);
    localStorage.setItem(CLOSE_ACTIONS_STORAGE_KEY, JSON.stringify(actions));
  };

  const setSkipEmailIfNoChanges = (skip: boolean) => {
    setSkipEmailIfNoChangesState(skip);
    localStorage.setItem(SKIP_EMAIL_NO_CHANGES_KEY, String(skip));
  };

  useEffect(() => {
    const handleExternal = (action: string) => {
      markChanged(action);
    };
    externalChangeListeners.add(handleExternal);
    return () => {
      externalChangeListeners.delete(handleExternal);
    };
  }, [markChanged]);

  return (
    <ChangeTrackingContext.Provider
      value={{
        hasChanges,
        changeCount,
        lastChangedAt,
        lastSavedAt,
        changes,
        markChanged,
        resetChanges,
        skipEmailIfNoChanges,
        setSkipEmailIfNoChanges,
        closePreferenceMode,
        setClosePreferenceMode,
        closePreferenceActions,
        setClosePreferenceActions,
      }}
    >
      {children}
    </ChangeTrackingContext.Provider>
  );
};

export function useChangeTracker() {
  const context = useContext(ChangeTrackingContext);
  if (!context) {
    // Fallback safe dummy object if used outside provider
    return {
      hasChanges: false,
      changeCount: 0,
      lastChangedAt: null,
      lastSavedAt: null,
      changes: [],
      markChanged: () => {},
      resetChanges: () => {},
      skipEmailIfNoChanges: true,
      setSkipEmailIfNoChanges: () => {},
      closePreferenceMode: "ask" as const,
      setClosePreferenceMode: () => {},
      closePreferenceActions: ["backup", "email"],
      setClosePreferenceActions: () => {},
    };
  }
  return context;
}
