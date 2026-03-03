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
  id?: string;
  name?: string;
  models: Record<string, Model>;
};

type ModelRegistryResponse = Record<string, Provider>;

export type ModelSelectorValue = {
  providerID: string;
  modelID: string;
};

type ProviderModel = {
  providerID: string;
  providerName: string;
  model: Model;
};

const MODELS_ENDPOINT = "https://models.ideavo.ai/api.json";
const MODEL_PROVIDERS = "ideavo";

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

const getDefaultModel = (models: ProviderModel[]) => {
  const preferred = models.find(
    ({ model }) => model.id === "anthropic/claude-sonnet-4-6",
  );
  return preferred ?? models[0];
};

interface ModelSelectorProps {
  value?: ModelSelectorValue;
  onChange: (model: ModelSelectorValue) => void;
  disabled?: boolean;
  className?: string;
}

export const ModelSelector = ({ value, onChange, disabled, className }: ModelSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<ProviderModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadModels = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const url = new URL(MODELS_ENDPOINT);
        url.searchParams.set("providers", MODEL_PROVIDERS);
        url.searchParams.set("t", `${Date.now()}`);

        const response = await fetch(url.toString(), {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as ModelRegistryResponse;
        const list = Object.entries(payload)
          .flatMap(([providerKey, provider]) => {
            if (!provider || typeof provider !== "object") {
              return [];
            }
            const providerID = provider.id ?? providerKey;
            const providerName = provider.name ?? providerID;
            return Object.values(provider.models ?? {}).map((model) => ({
              providerID,
              providerName,
              model,
            }));
          })
          .filter(({ model }) => model.status !== "deprecated" && model.tool_call !== false)
          .sort((a, b) => a.model.name.localeCompare(b.model.name));

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

    const hasCurrentValue = value
      ? models.some(
          (entry) =>
            entry.providerID === value.providerID && entry.model.id === value.modelID,
        )
      : false;
    if (!hasCurrentValue) {
      const nextModel = getDefaultModel(models);
      if (nextModel) {
        onChange({
          providerID: nextModel.providerID,
          modelID: nextModel.model.id,
        });
      }
    }
  }, [isLoading, models, onChange, value]);

  const selectedModel = useMemo(
    () =>
      models.find(
        (entry) =>
          entry.providerID === value?.providerID && entry.model.id === value?.modelID,
      ) ?? null,
    [models, value],
  );

  const label = isLoading
    ? "Loading models..."
    : error
      ? "Model list unavailable"
      : (selectedModel?.model.name ?? "Select model");

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
            <svg className={getFamilyIconClassName(selectedModel.model.family)}>
              <use href={`/models.svg${getFamilyIcon(selectedModel.model.family)}`} />
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
                {models.map((entry) => {
                  const isSelected =
                    entry.providerID === selectedModel?.providerID &&
                    entry.model.id === selectedModel?.model.id;

                  return (
                    <CommandItem
                      key={`${entry.providerID}/${entry.model.id}`}
                      value={`${entry.model.name} ${entry.providerName} ${entry.model.id}`}
                      onSelect={() => {
                        onChange({
                          providerID: entry.providerID,
                          modelID: entry.model.id,
                        });
                        setOpen(false);
                      }}
                      className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-white/85 data-[selected=true]:bg-white/10 data-[selected=true]:text-white/85 cursor-pointer"
                    >
                      <svg className={getFamilyIconClassName(entry.model.family)}>
                        <use href={`/models.svg${getFamilyIcon(entry.model.family)}`} />
                      </svg>
                      <span className="flex-1 truncate">{entry.model.name}</span>
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
