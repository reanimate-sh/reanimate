"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

type Model = {
  id: string;
  name: string;
  family?: string;
  tool_call?: boolean;
  status?: "alpha" | "beta" | "deprecated";
};

type Provider = {
  models: Record<string, Model>;
};

type ModelRegistryResponse = {
  ideavo?: Provider;
};

const MODELS_ENDPOINT = "https://models.ideavo.ai/api.json?providers=ideavo";

const getIconName = (family?: string) => {
  if (!family) return "stealth";
  if (family.startsWith("claude")) return "anthropic";
  if (family.startsWith("glm")) return "z-ai";
  if (family.startsWith("grok")) return "x-ai";
  if (family.startsWith("gemini")) return "google";
  if (family.startsWith("qwen")) return "qwen";
  if (family.startsWith("kimi")) return "moonshot";
  if (family.startsWith("minimax")) return "minimax";
  if (family.startsWith("gpt") || family.startsWith("o-")) return "openai";
  if (family.startsWith("ideavo")) return "ideavo";
  return "stealth";
};

const getFamilyIcon = (family?: string) => `#${getIconName(family)}`;

const getFamilyIconClassName = (family?: string) => {
  const iconName = getIconName(family);
  const noInvert = ["anthropic", "qwen", "stealth"];

  if (noInvert.includes(iconName)) {
    return "size-4 shrink-0 object-contain";
  }

  return "size-4 shrink-0 object-contain dark:invert";
};

const getDefaultModelId = (models: Model[]) => {
  const preferred = models.find((model) => model.id === "anthropic/claude-sonnet-4-6");
  return preferred?.id ?? models[0]?.id;
};

interface ModelSelectorProps {
  value?: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
  className?: string;
}

export const ModelSelector = ({ value, onChange, disabled, className }: ModelSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadModels = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${MODELS_ENDPOINT}&t=${Date.now()}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as ModelRegistryResponse;
        const list = Object.values(payload.ideavo?.models ?? {})
          .filter((model) => model.status !== "deprecated" && model.tool_call !== false)
          .sort((a, b) => a.name.localeCompare(b.name));

        setModels(list);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setError(err instanceof Error ? err.message : "Failed to load models");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadModels();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (isLoading || models.length === 0) {
      return;
    }

    const hasCurrentValue = value ? models.some((model) => model.id === value) : false;
    if (!hasCurrentValue) {
      const nextModelId = getDefaultModelId(models);
      if (nextModelId) {
        onChange(nextModelId);
      }
    }
  }, [isLoading, models, onChange, value]);

  const selectedModel = useMemo(
    () => models.find((model) => model.id === value) ?? null,
    [models, value],
  );

  const label = isLoading
    ? "Loading models..."
    : error
      ? "Model list unavailable"
      : (selectedModel?.name ?? "Select model");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled || isLoading || models.length === 0}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 focus:border-white/25 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
            className,
          )}
        >
          {selectedModel ? (
            <svg className={getFamilyIconClassName(selectedModel.family)}>
              <use href={`/models.svg${getFamilyIcon(selectedModel.family)}`} />
            </svg>
          ) : null}
          <span className="max-w-[170px] truncate">{label}</span>
          <ChevronDown
            className={cn("size-3.5 text-white/60 transition-transform", open && "rotate-180")}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-64 p-1 rounded-2xl border border-white/10 bg-[#0a0e18] shadow-2xl"
      >
        {error ? (
          <p className="px-2 py-1.5 text-sm text-red-200/90">{error}</p>
        ) : (
          <Command className="bg-transparent">
            <CommandInput
              placeholder="Search models..."
              className="text-sm text-white/85 placeholder:text-white/40 h-8 outline-none focus:outline-none focus:ring-0 border-none"
            />
            <CommandList className="max-h-60">
              <CommandEmpty className="text-sm text-white/40 py-4">No models found.</CommandEmpty>
              <CommandGroup>
                {models.map((model) => {
                  const isSelected = model.id === selectedModel?.id;

                  return (
                    <CommandItem
                      key={model.id}
                      value={model.name}
                      onSelect={() => {
                        onChange(model.id);
                        setOpen(false);
                      }}
                      className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-white/85 data-[selected=true]:bg-white/10 data-[selected=true]:text-white/85 cursor-pointer"
                    >
                      <svg className={getFamilyIconClassName(model.family)}>
                        <use href={`/models.svg${getFamilyIcon(model.family)}`} />
                      </svg>
                      <span className="flex-1 truncate">{model.name}</span>
                      {isSelected ? <Check className="size-3.5 text-white" /> : null}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
};
