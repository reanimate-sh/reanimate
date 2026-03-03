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

export type ReviewDiffStyle = "unified" | "split";

export type LayoutState = {
  sidebar: {
    opened: boolean;
    width: number;
  };
  terminal: {
    height: number;
    opened: boolean;
  };
  review: {
    diffStyle: ReviewDiffStyle;
    panelOpened: boolean;
  };
  fileTree: {
    opened: boolean;
    width: number;
    tab: "changes" | "all";
  };
  mobileSidebar: {
    opened: boolean;
  };
};

const DEFAULT_PANEL_WIDTH = 344;
const DEFAULT_TERMINAL_HEIGHT = 280;

function createInitialLayoutState(): LayoutState {
  return {
    sidebar: { opened: true, width: DEFAULT_PANEL_WIDTH },
    terminal: { height: DEFAULT_TERMINAL_HEIGHT, opened: false },
    review: { diffStyle: "split", panelOpened: true },
    fileTree: { opened: true, width: DEFAULT_PANEL_WIDTH, tab: "changes" },
    mobileSidebar: { opened: false },
  };
}

function loadLayoutState(): LayoutState {
  if (typeof window === "undefined") return createInitialLayoutState();
  try {
    const stored = localStorage.getItem("opencode:layout");
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<LayoutState>;
      return { ...createInitialLayoutState(), ...parsed };
    }
  } catch {
    // ignore
  }
  return createInitialLayoutState();
}

type LayoutContextValue = {
  state: LayoutState;
  sidebar: {
    opened: () => boolean;
    toggle: () => void;
    open: () => void;
    close: () => void;
    setWidth: (width: number) => void;
  };
  terminal: {
    opened: () => boolean;
    toggle: () => void;
    setHeight: (height: number) => void;
  };
  review: {
    diffStyle: () => ReviewDiffStyle;
    setDiffStyle: (style: ReviewDiffStyle) => void;
    panelOpened: () => boolean;
    togglePanel: () => void;
  };
  fileTree: {
    opened: () => boolean;
    toggle: () => void;
    setWidth: (width: number) => void;
    tab: () => "changes" | "all";
    setTab: (tab: "changes" | "all") => void;
  };
  mobileSidebar: {
    opened: () => boolean;
    toggle: () => void;
  };
};

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

export function LayoutProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<LayoutState>(loadLayoutState);

  const saveRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const persist = useCallback((next: LayoutState) => {
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => {
      try {
        localStorage.setItem("opencode:layout", JSON.stringify(next));
      } catch {
        // ignore
      }
    }, 300);
  }, []);

  const update = useCallback(
    (updater: (prev: LayoutState) => LayoutState) => {
      setState((prev) => {
        const next = updater(prev);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  useEffect(() => {
    return () => {
      if (saveRef.current) clearTimeout(saveRef.current);
    };
  }, []);

  const value: LayoutContextValue = {
    state,
    sidebar: {
      opened: () => state.sidebar.opened,
      toggle: () => update((s) => ({ ...s, sidebar: { ...s.sidebar, opened: !s.sidebar.opened } })),
      open: () => update((s) => ({ ...s, sidebar: { ...s.sidebar, opened: true } })),
      close: () => update((s) => ({ ...s, sidebar: { ...s.sidebar, opened: false } })),
      setWidth: (width) => update((s) => ({ ...s, sidebar: { ...s.sidebar, width } })),
    },
    terminal: {
      opened: () => state.terminal.opened,
      toggle: () => update((s) => ({ ...s, terminal: { ...s.terminal, opened: !s.terminal.opened } })),
      setHeight: (height) => update((s) => ({ ...s, terminal: { ...s.terminal, height } })),
    },
    review: {
      diffStyle: () => state.review.diffStyle,
      setDiffStyle: (diffStyle) => update((s) => ({ ...s, review: { ...s.review, diffStyle } })),
      panelOpened: () => state.review.panelOpened,
      togglePanel: () => update((s) => ({ ...s, review: { ...s.review, panelOpened: !s.review.panelOpened } })),
    },
    fileTree: {
      opened: () => state.fileTree.opened,
      toggle: () => update((s) => ({ ...s, fileTree: { ...s.fileTree, opened: !s.fileTree.opened } })),
      setWidth: (width) => update((s) => ({ ...s, fileTree: { ...s.fileTree, width } })),
      tab: () => state.fileTree.tab,
      setTab: (tab) => update((s) => ({ ...s, fileTree: { ...s.fileTree, tab } })),
    },
    mobileSidebar: {
      opened: () => state.mobileSidebar.opened,
      toggle: () => update((s) => ({ ...s, mobileSidebar: { opened: !s.mobileSidebar.opened } })),
    },
  };

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used within LayoutProvider");
  return ctx;
}
