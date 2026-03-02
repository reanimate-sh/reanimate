import {
  internalMutation,
  internalQuery,
  MutationCtx,
  mutation,
  query,
  QueryCtx,
} from "./_generated/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";
import {
  encrypt,
  encryptIntegrations,
  decryptIntegrations,
  sanitizeIntegrations,
} from "./lib/encryption";

export const current = query({
  args: { decrypt: v.optional(v.boolean()) },
  handler: async (ctx, { decrypt }) => {
    const user = await getCurrentUser(ctx);
    if (!user || !user.integrations) return user;
    const integrations = user.integrations as Record<string, unknown>;
    return {
      ...user,
      integrations: decrypt
        ? await decryptIntegrations(integrations)
        : sanitizeIntegrations(integrations),
    };
  },
});

export const updateIntegration = mutation({
  args: { name: v.string(), data: v.any() },
  handler: async (ctx, { name, data }) => {
    const user = await getCurrentUserOrThrow(ctx);
    const existing = (user.integrations as Record<string, unknown>) ?? {};

    if (data === null) {
      const { [name]: _, ...rest } = existing;
      await ctx.db.patch("users", user._id, { integrations: rest });
      return;
    }

    const encryptedEntry = await encryptIntegrations({ [name]: data });
    await ctx.db.patch("users", user._id, {
      integrations: { ...existing, ...encryptedEntry },
    });
  },
});

export const updateLLMProvider = mutation({
  args: {
    provider: v.string(),
    apiKey: v.union(v.string(), v.null()),
  },
  handler: async (ctx, { provider, apiKey }) => {
    const user = await getCurrentUserOrThrow(ctx);
    const existing = (user.integrations as Record<string, unknown>) ?? {};
    const existingProviders = (existing.llmProviders as Record<string, unknown>[] | undefined) ?? [];

    const filtered = existingProviders.filter(
      (p) => p.provider !== provider
    );

    const updatedProviders =
      apiKey === null
        ? filtered
        : [
            ...filtered,
            {
              provider,
              apiKey: await encrypt(apiKey.trim()),
              connectedAt: new Date().toISOString(),
            },
          ];

    await ctx.db.patch("users", user._id, {
      integrations: {
        ...existing,
        llmProviders: updatedProviders.length ? updatedProviders : undefined,
      },
    });
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const userAttributes = {
      name: `${data.first_name} ${data.last_name}`,
      externalId: data.id,
      email: data.email_addresses[0]?.email_address,
    };

    const user = await userByExternalId(ctx, data.id);
    if (!user) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch("users", user._id, userAttributes);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId);

    if (user) {
      await ctx.db.delete("users", user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
      );
    }
  },
});

type AuthCtx = QueryCtx | MutationCtx;

export async function getCurrentUserOrThrow(ctx: AuthCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }

  const user = await userByExternalId(ctx, identity.subject);
  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function getCurrentUser(ctx: AuthCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return await userByExternalId(ctx, identity.subject);
}

async function userByExternalId(ctx: AuthCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique();
}

// Used by the Dodo identify function to look up a user by their Clerk ID.
export const getByExternalId = internalQuery({
  args: { externalId: v.string() },
  handler: async (ctx, { externalId }) => {
    return await userByExternalId(ctx, externalId);
  },
});
