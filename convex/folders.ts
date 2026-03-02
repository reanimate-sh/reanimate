import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("folders")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const getById = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, { folderId }) => {
    const user = await getCurrentUserOrThrow(ctx);

    const folder = await ctx.db.get("folders", folderId);
    if (!folder || folder.userId !== user._id) {
      return null;
    }

    return folder;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    parentId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    if (args.parentId) {
      const parent = await ctx.db.get("folders", args.parentId);
      if (!parent || parent.userId !== user._id) {
        throw new Error("Parent folder not found");
      }
    }

    const now = new Date().toISOString();
    const folderId = await ctx.db.insert("folders", {
      name: args.name,
      parentId: args.parentId,
      userId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get("folders", folderId);
  },
});

export const update = mutation({
  args: {
    folderId: v.id("folders"),
    name: v.optional(v.string()),
    parentId: v.optional(v.union(v.id("folders"), v.null())),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const folder = await ctx.db.get("folders", args.folderId);
    if (!folder || folder.userId !== user._id) {
      throw new Error("Folder not found");
    }

    if (args.parentId !== undefined && args.parentId !== null) {
      if (args.parentId === args.folderId) {
        throw new Error("Folder cannot be its own parent");
      }
      const parent = await ctx.db.get("folders", args.parentId);
      if (!parent || parent.userId !== user._id) {
        throw new Error("Parent folder not found");
      }
    }

    const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (args.name !== undefined) patch.name = args.name;
    if (args.parentId !== undefined) patch.parentId = args.parentId === null ? undefined : args.parentId;

    await ctx.db.patch("folders", args.folderId, patch);

    return await ctx.db.get("folders", args.folderId);
  },
});

export const remove = mutation({
  args: { folderId: v.id("folders") },
  handler: async (ctx, { folderId }) => {
    const user = await getCurrentUserOrThrow(ctx);

    const folder = await ctx.db.get("folders", folderId);
    if (!folder || folder.userId !== user._id) {
      throw new Error("Folder not found");
    }

    const now = new Date().toISOString();

    const children = await ctx.db
      .query("folders")
      .withIndex("byUserIdParentId", (q) =>
        q.eq("userId", user._id).eq("parentId", folderId)
      )
      .collect();

    for (const child of children) {
      await ctx.db.patch("folders", child._id, {
        parentId: folder.parentId,
        updatedAt: now,
      });
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("byFolderId", (q) => q.eq("folderId", folderId))
      .collect();

    for (const project of projects) {
      if (project.userId !== user._id) {
        continue;
      }

      await ctx.db.patch("projects", project._id, {
        folderId: folder.parentId,
        updatedAt: now,
      });
    }

    await ctx.db.delete("folders", folderId);
    return { success: true };
  },
});
