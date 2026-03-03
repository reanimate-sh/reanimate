"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { useOpenCode } from "../../context";
import type { ModelOption, ModelRef } from "../../types";

type DialogSelectModelProps = {
  open: boolean;
  onClose: () => void;
  onSelect?: (model: ModelRef) => void;
};

export function DialogSelectModel({
  open,
  onClose,
  onSelect,
}: DialogSelectModelProps) {
  const { state, actions } = useOpenCode();
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Focus search on open
  useEffect(() => {
    if (open) {
      setSearch("");
      setHighlighted(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Group by provider
  const grouped = useMemo(() => {
    const q = search.toLowerCase().trim();
    const filtered = q
      ? state.modelOptions.filter(
          (opt) =>
            opt.label.toLowerCase().includes(q) ||
            opt.modelID.toLowerCase().includes(q) ||
            opt.providerID.toLowerCase().includes(q),
        )
      : state.modelOptions;

    const groups = new Map<string, ModelOption[]>();
    for (const opt of filtered) {
      const existing = groups.get(opt.providerID);
      if (existing) existing.push(opt);
      else groups.set(opt.providerID, [opt]);
    }
    return groups;
  }, [state.modelOptions, search]);

  const flatOptions = useMemo(() => {
    const list: ModelOption[] = [];
    for (const models of grouped.values()) {
      list.push(...models);
    }
    return list;
  }, [grouped]);

  useEffect(() => {
    if (flatOptions.length === 0) {
      setHighlighted(0);
      return;
    }
    if (highlighted >= flatOptions.length) {
      setHighlighted(flatOptions.length - 1);
    }
  }, [flatOptions, highlighted]);

  const handleSelect = (opt: ModelOption) => {
    const ref: ModelRef = { providerID: opt.providerID, modelID: opt.modelID };
    actions.setSelectedModel(ref);
    onSelect?.(ref);
    onClose();
  };

  const isSelected = (opt: ModelOption) =>
    state.selectedModel?.providerID === opt.providerID &&
    state.selectedModel?.modelID === opt.modelID;

  const isHighlighted = (opt: ModelOption) => {
    const item = flatOptions[highlighted];
    return (
      !!item &&
      item.providerID === opt.providerID &&
      item.modelID === opt.modelID
    );
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-[520px] max-w-[96vw] max-h-[60vh] flex flex-col rounded-2xl border border-zinc-700/70 bg-[#0c1020] shadow-2xl overflow-hidden">
        {/* Search header */}
        <div className="flex items-center gap-2 border-b border-zinc-800/60 px-3 py-2.5">
          <Search className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                if (flatOptions.length === 0) return;
                setHighlighted((prev) => (prev + 1) % flatOptions.length);
                return;
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                if (flatOptions.length === 0) return;
                setHighlighted(
                  (prev) =>
                    (prev - 1 + flatOptions.length) % flatOptions.length,
                );
                return;
              }
              if (e.key === "Enter") {
                const current = flatOptions[highlighted];
                if (!current) return;
                e.preventDefault();
                handleSelect(current);
              }
            }}
            placeholder="Search models…"
            className="flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-zinc-600 hover:text-zinc-400"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto py-1">
          {grouped.size === 0 && (
            <div className="px-4 py-6 text-center text-sm text-zinc-600">
              {state.modelOptions.length === 0
                ? "No models available"
                : "No matching models"}
            </div>
          )}

          {Array.from(grouped.entries()).map(([providerID, models]) => (
            <div key={providerID}>
              <div className="sticky top-0 z-10 bg-[#0c1020] px-4 py-1.5 text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                {providerID}
              </div>
              {models.map((opt) => {
                const selected = isSelected(opt);
                return (
                  <button
                    key={`${opt.providerID}/${opt.modelID}`}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => {
                      const idx = flatOptions.findIndex(
                        (entry) =>
                          entry.providerID === opt.providerID &&
                          entry.modelID === opt.modelID,
                      );
                      if (idx >= 0) setHighlighted(idx);
                    }}
                    className={`w-full px-4 py-2 text-left transition-colors hover:bg-zinc-800/70 flex items-center justify-between gap-2 ${
                      selected || isHighlighted(opt) ? "bg-zinc-800/50" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm text-zinc-100 truncate">
                        {opt.modelID}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {opt.label}
                      </div>
                    </div>
                    {selected && (
                      <span className="shrink-0 text-zinc-300">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
