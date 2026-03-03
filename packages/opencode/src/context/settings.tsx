"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

export interface NotificationSettings {
  agent: boolean;
  permissions: boolean;
  errors: boolean;
}

export interface SoundSettings {
  agentEnabled: boolean;
  agent: string;
  permissionsEnabled: boolean;
  permissions: string;
  errorsEnabled: boolean;
  errors: string;
}

export interface Settings {
  general: {
    autoSave: boolean;
    releaseNotes: boolean;
  };
  updates: {
    startup: boolean;
  };
  appearance: {
    fontSize: number;
    font: string;
  };
  keybinds: Record<string, string>;
  permissions: {
    autoApprove: boolean;
  };
  notifications: NotificationSettings;
  sounds: SoundSettings;
}

const defaultSettings: Settings = {
  general: {
    autoSave: true,
    releaseNotes: true,
  },
  updates: {
    startup: true,
  },
  appearance: {
    fontSize: 14,
    font: "ibm-plex-mono",
  },
  keybinds: {},
  permissions: {
    autoApprove: false,
  },
  notifications: {
    agent: true,
    permissions: true,
    errors: false,
  },
  sounds: {
    agentEnabled: true,
    agent: "staplebops-01",
    permissionsEnabled: true,
    permissions: "staplebops-02",
    errorsEnabled: true,
    errors: "nope-03",
  },
};

const monoFallback =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export const monoFonts: Record<string, string> = {
  "ibm-plex-mono": `"IBM Plex Mono", ${monoFallback}`,
  "cascadia-code": `"Cascadia Code", ${monoFallback}`,
  "fira-code": `"Fira Code", ${monoFallback}`,
  hack: `"Hack", ${monoFallback}`,
  inconsolata: `"Inconsolata", ${monoFallback}`,
  "jetbrains-mono": `"JetBrains Mono", ${monoFallback}`,
  "roboto-mono": `"Roboto Mono", ${monoFallback}`,
  "source-code-pro": `"Source Code Pro", ${monoFallback}`,
};

export function monoFontFamily(font: string | undefined): string {
  return monoFonts[font ?? defaultSettings.appearance.font] ?? monoFonts[defaultSettings.appearance.font]!;
}

function deepMerge(defaults: Settings, stored: Partial<Settings>): Settings {
  return {
    general: { ...defaults.general, ...(stored.general ?? {}) },
    updates: { ...defaults.updates, ...(stored.updates ?? {}) },
    appearance: { ...defaults.appearance, ...(stored.appearance ?? {}) },
    keybinds: { ...defaults.keybinds, ...(stored.keybinds ?? {}) },
    permissions: { ...defaults.permissions, ...(stored.permissions ?? {}) },
    notifications: { ...defaults.notifications, ...(stored.notifications ?? {}) },
    sounds: { ...defaults.sounds, ...(stored.sounds ?? {}) },
  };
}

function loadSettings(): Settings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const stored = localStorage.getItem("opencode:settings.v3");
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<Settings>;
      return deepMerge(defaultSettings, parsed);
    }
  } catch {
    // ignore
  }
  return defaultSettings;
}

type SettingsContextValue = {
  settings: Settings;
  general: {
    autoSave: boolean;
    setAutoSave: (value: boolean) => void;
    releaseNotes: boolean;
    setReleaseNotes: (value: boolean) => void;
  };
  appearance: {
    fontSize: number;
    setFontSize: (value: number) => void;
    font: string;
    setFont: (value: string) => void;
  };
  keybinds: {
    get: (action: string) => string | undefined;
    set: (action: string, keybind: string) => void;
    reset: (action: string) => void;
    all: () => Record<string, string>;
  };
  permissions: {
    autoApprove: boolean;
    setAutoApprove: (value: boolean) => void;
  };
  notifications: {
    current: NotificationSettings;
    set: (key: keyof NotificationSettings, value: boolean) => void;
  };
  sounds: {
    current: SoundSettings;
    set: <K extends keyof SoundSettings>(key: K, value: SoundSettings[K]) => void;
  };
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const saveRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const persist = useCallback((next: Settings) => {
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => {
      try {
        localStorage.setItem("opencode:settings.v3", JSON.stringify(next));
      } catch {
        // ignore
      }
    }, 300);
  }, []);

  const update = useCallback(
    (updater: (prev: Settings) => Settings) => {
      setSettings((prev) => {
        const next = updater(prev);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty(
      "--font-family-mono",
      monoFontFamily(settings.appearance.font),
    );
  }, [settings.appearance.font]);

  useEffect(() => {
    return () => {
      if (saveRef.current) clearTimeout(saveRef.current);
    };
  }, []);

  const value: SettingsContextValue = {
    settings,
    general: {
      autoSave: settings.general.autoSave,
      setAutoSave: (value) => update((s) => ({ ...s, general: { ...s.general, autoSave: value } })),
      releaseNotes: settings.general.releaseNotes,
      setReleaseNotes: (value) => update((s) => ({ ...s, general: { ...s.general, releaseNotes: value } })),
    },
    appearance: {
      fontSize: settings.appearance.fontSize,
      setFontSize: (value) => update((s) => ({ ...s, appearance: { ...s.appearance, fontSize: value } })),
      font: settings.appearance.font,
      setFont: (value) => update((s) => ({ ...s, appearance: { ...s.appearance, font: value } })),
    },
    keybinds: {
      get: (action) => settings.keybinds[action],
      set: (action, keybind) =>
        update((s) => ({ ...s, keybinds: { ...s.keybinds, [action]: keybind } })),
      reset: (action) =>
        update((s) => {
          const next = { ...s.keybinds };
          delete next[action];
          return { ...s, keybinds: next };
        }),
      all: () => settings.keybinds,
    },
    permissions: {
      autoApprove: settings.permissions.autoApprove,
      setAutoApprove: (value) => update((s) => ({ ...s, permissions: { ...s.permissions, autoApprove: value } })),
    },
    notifications: {
      current: settings.notifications,
      set: (key, value) =>
        update((s) => ({ ...s, notifications: { ...s.notifications, [key]: value } })),
    },
    sounds: {
      current: settings.sounds,
      set: (key, value) =>
        update((s) => ({ ...s, sounds: { ...s.sounds, [key]: value } })),
    },
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
