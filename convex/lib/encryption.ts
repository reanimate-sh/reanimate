const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getEnv() {
  const key = process.env.AES_KEY;
  const version = process.env.AES_KEY_VERSION;
  if (!key || !version) {
    throw new Error("AES_KEY and AES_KEY_VERSION env vars are required");
  }
  return { key, version };
}

async function importKey(base64Key: string): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
  return globalThis.crypto.subtle.importKey(
    "raw",
    raw,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

export function isEncrypted(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  const sep = value.indexOf(":");
  if (sep <= 0) return false;
  const version = process.env.AES_KEY_VERSION;
  if (!version) return false;
  return value.slice(0, sep) === version;
}

export async function encrypt(plaintext: string): Promise<string> {
  if (!plaintext || typeof plaintext !== "string") {
    throw new Error("Invalid input");
  }
  if (isEncrypted(plaintext)) return plaintext;

  const { key, version } = getEnv();
  const cryptoKey = await importKey(key);

  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);

  const cipherBuffer = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv, tagLength: TAG_LENGTH * 8 },
    cryptoKey,
    encoded
  );

  const combined = new Uint8Array(IV_LENGTH + cipherBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuffer), IV_LENGTH);

  const base64 = btoa(String.fromCharCode(...combined));
  return `${version}:${base64}`;
}

export async function decrypt(ciphertext: string): Promise<string> {
  if (!ciphertext || typeof ciphertext !== "string") {
    throw new Error("Invalid ciphertext");
  }

  const colonIdx = ciphertext.indexOf(":");
  if (colonIdx <= 0) throw new Error("Invalid ciphertext format");

  const version = ciphertext.slice(0, colonIdx);
  const { key, version: currentVersion } = getEnv();

  if (version !== currentVersion) {
    throw new Error(`Unsupported key version: ${version}`);
  }

  const cryptoKey = await importKey(key);
  const combined = Uint8Array.from(atob(ciphertext.slice(colonIdx + 1)), (c) =>
    c.charCodeAt(0)
  );

  const iv = combined.slice(0, IV_LENGTH);
  const cipherData = combined.slice(IV_LENGTH);

  const decrypted = await globalThis.crypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: TAG_LENGTH * 8 },
    cryptoKey,
    cipherData
  );

  return new TextDecoder().decode(decrypted);
}

export function getIntegrationTokenKey(name: string): string | undefined {
  const keyMap: Record<string, string> = {
    e2b: "apiKey",
    llmProviders: "apiKey",
  };
  return keyMap[name];
}

export function sanitizeIntegrations(
  integrations: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [name, integration] of Object.entries(integrations)) {
    if (!integration) {
      result[name] = integration;
      continue;
    }

    if (Array.isArray(integration)) {
      const tokenKey = getIntegrationTokenKey(name);
      result[name] = integration.map((item: Record<string, unknown>) => {
        if (!tokenKey) return item;
        const { [tokenKey]: _, ...rest } = item;
        return rest;
      });
      continue;
    }

    if (typeof integration !== "object") {
      result[name] = integration;
      continue;
    }

    const tokenKey = getIntegrationTokenKey(name);
    if (tokenKey) {
      const { [tokenKey]: _, ...rest } = integration as Record<string, unknown>;
      result[name] = rest;
    } else {
      result[name] = integration;
    }
  }

  return result;
}

export async function encryptIntegrations(
  integrations: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const result: Record<string, unknown> = {};

  for (const [name, integration] of Object.entries(integrations)) {
    if (!integration) {
      result[name] = integration;
      continue;
    }

    if (Array.isArray(integration)) {
      result[name] = await Promise.all(
        integration.map(async (item: Record<string, unknown>) => {
          const tokenKey = getIntegrationTokenKey(name);
          if (!tokenKey) return item;
          const token = item[tokenKey];
          if (token && typeof token === "string" && !isEncrypted(token)) {
            return { ...item, [tokenKey]: await encrypt(token) };
          }
          return item;
        })
      );
      continue;
    }

    if (typeof integration !== "object") {
      result[name] = integration;
      continue;
    }

    const entry = { ...(integration as Record<string, unknown>) };
    const tokenKey = getIntegrationTokenKey(name);

    if (tokenKey) {
      const token = entry[tokenKey];
      if (token && typeof token === "string" && !isEncrypted(token)) {
        entry[tokenKey] = await encrypt(token);
      }
    }

    result[name] = entry;
  }

  return result;
}

export async function decryptIntegrations(
  integrations: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const result: Record<string, unknown> = {};

  for (const [name, integration] of Object.entries(integrations)) {
    if (!integration) {
      result[name] = integration;
      continue;
    }

    if (Array.isArray(integration)) {
      result[name] = await Promise.all(
        integration.map(async (item: Record<string, unknown>) => {
          const tokenKey = getIntegrationTokenKey(name);
          if (!tokenKey) return item;
          const token = item[tokenKey];
          if (token && typeof token === "string" && isEncrypted(token)) {
            return { ...item, [tokenKey]: await decrypt(token) };
          }
          return item;
        })
      );
      continue;
    }

    if (typeof integration !== "object") {
      result[name] = integration;
      continue;
    }

    const entry = { ...(integration as Record<string, unknown>) };
    const tokenKey = getIntegrationTokenKey(name);

    if (tokenKey) {
      const token = entry[tokenKey];
      if (token && typeof token === "string" && isEncrypted(token)) {
        entry[tokenKey] = await decrypt(token);
      }
    }

    result[name] = entry;
  }

  return result;
}
