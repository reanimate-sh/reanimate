"use client";

import { OpenCodeProvider } from "../context";
import type { OpenCodeProviderProps } from "../context";
import { LayoutProvider } from "../context/layout";
import { SettingsProvider } from "../context/settings";
import { Layout } from "../pages/Layout";

export type OpenCodeAppProps = OpenCodeProviderProps & {
  className?: string;
};

export function OpenCodeApp(props: OpenCodeAppProps) {
  return (
    <SettingsProvider>
      <LayoutProvider>
        <OpenCodeProvider
          baseUrl={props.baseUrl}
          directory={props.directory}
          fetch={props.fetch}
          initialPrompt={props.initialPrompt}
          initialModel={props.initialModel}
        >
          <Layout className={props.className} />
        </OpenCodeProvider>
      </LayoutProvider>
    </SettingsProvider>
  );
}
