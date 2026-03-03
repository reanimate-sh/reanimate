"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useSettings, monoFonts } from "../../context/settings";
import { useOpenCode } from "../../context";
import { DEFAULT_KEYBINDS } from "../../keybind";

type TabKey =
  | "general"
  | "appearance"
  | "keybinds"
  | "models"
  | "providers"
  | "permissions"
  | "mcp"
  | "agents";

const TABS: { key: TabKey; label: string }[] = [
  { key: "general", label: "General" },
  { key: "appearance", label: "Appearance" },
  { key: "keybinds", label: "Keybinds" },
  { key: "models", label: "Models" },
  { key: "providers", label: "Providers" },
  { key: "permissions", label: "Permissions" },
  { key: "mcp", label: "MCP" },
  { key: "agents", label: "Agents" },
];

type DialogSettingsProps = {
  open: boolean;
  onClose: () => void;
};

export function DialogSettings({ open, onClose }: DialogSettingsProps) {
  const settings = useSettings();
  const { state } = useOpenCode();
  const [tab, setTab] = useState<TabKey>("general");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative flex h-[580px] w-[760px] max-w-[96vw] max-h-[90vh] overflow-hidden rounded-2xl border border-zinc-700/70 bg-[#0c1020] shadow-2xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 size-7 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>

        {/* Left nav */}
        <nav className="flex w-48 shrink-0 flex-col border-r border-zinc-800/60 py-3">
          <div className="px-4 pb-3 text-[11px] uppercase tracking-[0.14em] text-zinc-500">
            Settings
          </div>
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-1.5 text-left text-sm transition-colors ${
                tab === key
                  ? "bg-zinc-800/70 text-zinc-100"
                  : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "general" && <GeneralSettings settings={settings} />}
          {tab === "appearance" && <AppearanceSettings settings={settings} />}
          {tab === "keybinds" && <KeybindsSettings settings={settings} />}
          {tab === "providers" && <ProvidersSettings state={state} />}
          {tab === "models" && <ModelsSettings state={state} />}
          {tab === "agents" && <AgentsSettings state={state} />}
          {tab === "mcp" && <McpSettings />}
          {tab === "permissions" && <PermissionsSettings settings={settings} />}
        </div>
      </div>
    </div>
  );
}

// ── General ───────────────────────────────────────────────────────────────────

function GeneralSettings({
  settings,
}: {
  settings: ReturnType<typeof useSettings>;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader title="General" />

      <SettingRow
        label="Auto-save"
        description="Automatically save files modified by the agent"
      >
        <Toggle
          checked={settings.general.autoSave}
          onChange={settings.general.setAutoSave}
        />
      </SettingRow>

      <SettingRow
        label="Release notes"
        description="Show release notes on startup after updates"
      >
        <Toggle
          checked={settings.general.releaseNotes}
          onChange={settings.general.setReleaseNotes}
        />
      </SettingRow>
    </div>
  );
}

// ── Appearance ────────────────────────────────────────────────────────────────

const FONT_OPTIONS = Object.keys(monoFonts).map((key) => ({
  value: key,
  label: key
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" "),
}));

function AppearanceSettings({
  settings,
}: {
  settings: ReturnType<typeof useSettings>;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Appearance" />

      <SettingRow label="Font size" description="Editor and terminal font size">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              settings.appearance.setFontSize(
                Math.max(10, settings.appearance.fontSize - 1),
              )
            }
            className="size-6 flex items-center justify-center rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm"
          >
            −
          </button>
          <span className="w-8 text-center text-sm text-zinc-100">
            {settings.appearance.fontSize}
          </span>
          <button
            type="button"
            onClick={() =>
              settings.appearance.setFontSize(
                Math.min(24, settings.appearance.fontSize + 1),
              )
            }
            className="size-6 flex items-center justify-center rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm"
          >
            +
          </button>
        </div>
      </SettingRow>

      <SettingRow
        label="Font family"
        description="Monospace font for code and terminal"
      >
        <select
          value={settings.appearance.font}
          onChange={(e) => settings.appearance.setFont(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-900/90 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-zinc-600"
        >
          {FONT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </SettingRow>
    </div>
  );
}

// ── Keybinds ──────────────────────────────────────────────────────────────────

function KeybindsSettings({
  settings,
}: {
  settings: ReturnType<typeof useSettings>;
}) {
  const [editing, setEditing] = useState<string | undefined>();

  useEffect(() => {
    if (!editing) return;

    const handler = (event: globalThis.KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.key === "Escape") {
        setEditing(undefined);
        return;
      }

      const isClear =
        (event.key === "Backspace" || event.key === "Delete") &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey;
      if (isClear) {
        settings.keybinds.set(editing, "none");
        setEditing(undefined);
        return;
      }

      if (["Shift", "Meta", "Control", "Alt"].includes(event.key)) return;

      const parts: string[] = [];
      if (event.metaKey || event.ctrlKey) parts.push("mod");
      if (event.altKey) parts.push("alt");
      if (event.shiftKey) parts.push("shift");

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (!key) return;
      parts.push(key === "," ? "comma" : key);

      settings.keybinds.set(editing, parts.join("+"));
      setEditing(undefined);
    };

    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [editing, settings.keybinds]);

  const hasCustom = Object.keys(settings.keybinds.all()).length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader title="Keyboard shortcuts" />
        <button
          type="button"
          disabled={!hasCustom}
          onClick={() => {
            for (const action of Object.keys(settings.keybinds.all())) {
              settings.keybinds.reset(action);
            }
          }}
          className="rounded border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
        >
          Reset all
        </button>
      </div>
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        {Object.entries(DEFAULT_KEYBINDS).map(([action, defaultBind]) => {
          const custom = settings.keybinds.get(action);
          const current = custom ?? defaultBind;
          const isEditing = editing === action;
          return (
            <div
              key={action}
              className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/60 last:border-b-0"
            >
              <div>
                <div className="text-sm text-zinc-200">{action}</div>
                {custom && (
                  <div className="text-[10px] text-zinc-500">
                    default: {defaultBind}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setEditing((prev) => (prev === action ? undefined : action))
                  }
                  className={`rounded border px-1.5 py-0.5 text-[11px] font-mono transition-colors ${
                    isEditing
                      ? "border-zinc-600 bg-zinc-800 text-zinc-100"
                      : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {isEditing ? "Press keys..." : current}
                </button>
                {custom && (
                  <button
                    type="button"
                    onClick={() => settings.keybinds.reset(action)}
                    className="text-[10px] text-zinc-600 hover:text-zinc-400"
                  >
                    reset
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Permissions ───────────────────────────────────────────────────────────────

function PermissionsSettings({
  settings,
}: {
  settings: ReturnType<typeof useSettings>;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Permissions" />

      <SettingRow
        label="Auto-approve"
        description="Automatically approve all tool permission requests"
      >
        <Toggle
          checked={settings.permissions.autoApprove}
          onChange={settings.permissions.setAutoApprove}
        />
      </SettingRow>
    </div>
  );
}

// ── Coming soon ───────────────────────────────────────────────────────────────

function ProvidersSettings({
  state,
}: {
  state: ReturnType<typeof useOpenCode>["state"];
}) {
  const { actions } = useOpenCode();
  const providers = state.providers?.all ?? [];
  const connected = new Set(state.providers?.connected ?? []);
  const [connecting, setConnecting] = useState<string | undefined>();

  return (
    <div className="space-y-4">
      <SectionHeader title="Providers" />
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        {providers.length === 0 && (
          <div className="px-3 py-4 text-sm text-zinc-500">
            No providers available.
          </div>
        )}
        {providers.map((provider) => {
          const isConnected = connected.has(provider.id);
          const methods = state.providerAuth?.[provider.id] ?? [];
          const oauthMethod = methods.findIndex(
            (entry) => entry.type === "oauth",
          );
          const hasOAuth = oauthMethod >= 0;
          return (
            <div
              key={provider.id}
              className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/60 last:border-b-0"
            >
              <div>
                <div className="text-sm text-zinc-200">{provider.name}</div>
                <div className="text-[10px] text-zinc-500">{provider.id}</div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                    isConnected
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                  }`}
                >
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
                {!isConnected && hasOAuth && (
                  <button
                    type="button"
                    disabled={connecting === provider.id}
                    onClick={async () => {
                      setConnecting(provider.id);
                      try {
                        await actions.authorizeProvider(
                          provider.id,
                          oauthMethod,
                        );
                      } finally {
                        setConnecting(undefined);
                      }
                    }}
                    className="rounded border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
                  >
                    {connecting === provider.id ? "Opening..." : "Connect"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ModelsSettings({
  state,
}: {
  state: ReturnType<typeof useOpenCode>["state"];
}) {
  const { actions } = useOpenCode();
  const providers = state.providers?.all ?? [];
  const connected = new Set(state.providers?.connected ?? []);

  return (
    <div className="space-y-4">
      <SectionHeader title="Models" />
      <div className="space-y-3">
        {providers
          .filter((provider) => connected.has(provider.id))
          .map((provider) => {
            const entries = Object.entries(provider.models ?? {});
            return (
              <div
                key={provider.id}
                className="rounded-lg border border-zinc-800 overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-zinc-800/60 text-xs text-zinc-500 uppercase tracking-[0.14em]">
                  {provider.name}
                </div>
                {entries.length === 0 && (
                  <div className="px-3 py-3 text-sm text-zinc-500">
                    No models listed.
                  </div>
                )}
                {entries.map(([modelID, model]) => {
                  const isDefault =
                    state.providers?.default?.[provider.id] === modelID;
                  return (
                    <div
                      key={`${provider.id}/${modelID}`}
                      className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/60 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm text-zinc-200">
                          {model.name || modelID}
                        </div>
                        <div className="truncate text-[10px] text-zinc-500">
                          {modelID}
                        </div>
                      </div>
                      {isDefault && (
                        <span className="rounded border border-zinc-600 bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-200">
                          Default
                        </span>
                      )}
                      {!isDefault && (
                        <button
                          type="button"
                          onClick={() =>
                            actions.setSelectedModel({
                              providerID: provider.id,
                              modelID,
                            })
                          }
                          className="rounded border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-300 hover:bg-zinc-800"
                        >
                          Use
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>
      {state.modelOptions.length === 0 && (
        <div className="text-xs text-zinc-500">
          Connect at least one provider to list models.
        </div>
      )}
    </div>
  );
}

function AgentsSettings({
  state,
}: {
  state: ReturnType<typeof useOpenCode>["state"];
}) {
  const { actions } = useOpenCode();
  const primaryAgents = state.agents.filter(
    (agent) => !agent.hidden && agent.mode === "primary",
  );
  return (
    <div className="space-y-4">
      <SectionHeader title="Agents" />
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        {primaryAgents.length === 0 && (
          <div className="px-3 py-4 text-sm text-zinc-500">
            No agents available.
          </div>
        )}
        {primaryAgents.map((agent) => (
          <div
            key={agent.name}
            className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/60 last:border-b-0"
          >
            <div>
              <div className="text-sm text-zinc-200">{agent.name}</div>
              <div className="text-[10px] text-zinc-500">
                mode: {agent.mode}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {state.selectedAgent === agent.name && (
                <span className="rounded border border-zinc-600 bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-200">
                  selected
                </span>
              )}
              {state.selectedAgent !== agent.name && (
                <button
                  type="button"
                  onClick={() => actions.setSelectedAgent(agent.name)}
                  className="rounded border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-300 hover:bg-zinc-800"
                >
                  Select
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function McpSettings() {
  return (
    <div className="space-y-4">
      <SectionHeader title="MCP" />
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-3 text-sm text-zinc-500">
        MCP server management is not wired yet in the React port.
      </div>
    </div>
  );
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <h2 className="text-base font-semibold text-zinc-100">{title}</h2>;
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm text-zinc-200">{label}</div>
        {description && (
          <div className="text-xs text-zinc-500 mt-0.5">{description}</div>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? "bg-zinc-300" : "bg-zinc-700"
      }`}
    >
      <span
        className={`inline-block size-3.5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
