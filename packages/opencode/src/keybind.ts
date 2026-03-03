export const DEFAULT_KEYBINDS: Record<string, string> = {
  "sidebar.toggle": "mod+b",
  "session.new": "mod+n",
  "session.close": "mod+w",
  "common.goBack": "mod+[",
  "common.goForward": "mod+]",
  "prompt.submit": "Enter",
  "session.abort": "mod+c",
  "settings.open": "mod+comma",
  "model.select": "mod+shift+m",
};

function normalizeKey(value: string) {
  const key = value.toLowerCase();
  if (key === "comma") return ",";
  if (key === "escape") return "escape";
  if (key === "arrowup") return "arrowup";
  if (key === "arrowdown") return "arrowdown";
  return key;
}

export function keybindFor(custom: Record<string, string>, action: string) {
  return custom[action] ?? DEFAULT_KEYBINDS[action];
}

export function matchesKeybind(event: KeyboardEvent, binding?: string) {
  if (!binding || binding === "none") return false;
  const tokens = binding.toLowerCase().split("+").filter(Boolean);
  if (tokens.length === 0) return false;
  const keyToken = normalizeKey(tokens[tokens.length - 1]!);
  const mod = tokens.includes("mod");
  const alt = tokens.includes("alt");
  const shift = tokens.includes("shift");
  const hasMod = event.metaKey || event.ctrlKey;
  const key = normalizeKey(event.key);
  if (key !== keyToken) return false;
  if (mod !== hasMod) return false;
  if (alt !== event.altKey) return false;
  if (shift !== event.shiftKey) return false;
  const allowedMeta = new Set(["mod", "alt", "shift", keyToken]);
  if (!mod && (event.metaKey || event.ctrlKey) && !allowedMeta.has("mod")) return false;
  return true;
}
