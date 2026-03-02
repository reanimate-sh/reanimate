import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("projects")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const getById = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const user = await getCurrentUserOrThrow(ctx);

    const project = await ctx.db.get("projects", projectId);
    if (!project || project.userId !== user._id) {
      return null;
    }

    return project;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    folderId: v.optional(v.id("folders")),
    metadata: v.any(),
    integrations: v.optional(v.any()),
    sandbox: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    if (args.folderId) {
      const folder = await ctx.db.get("folders", args.folderId);
      if (!folder || folder.userId !== user._id) {
        throw new Error("Folder not found");
      }
    }

    const now = new Date().toISOString();
    const projectId = await ctx.db.insert("projects", {
      title: args.title,
      userId: user._id,
      folderId: args.folderId,
      metadata: args.metadata,
      integrations: args.integrations,
      sandbox: args.sandbox,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get("projects", projectId);
  },
});

export const update = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.optional(v.string()),
    folderId: v.optional(v.union(v.id("folders"), v.null())),
    metadata: v.optional(v.any()),
    integrations: v.optional(v.any()),
    sandbox: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const project = await ctx.db.get("projects", args.projectId);
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found");
    }

    if (args.folderId !== undefined && args.folderId !== null) {
      const folder = await ctx.db.get("folders", args.folderId);
      if (!folder || folder.userId !== user._id) {
        throw new Error("Folder not found");
      }
    }

    const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (args.title !== undefined) patch.title = args.title;
    if (args.folderId !== undefined) patch.folderId = args.folderId === null ? undefined : args.folderId;
    if (args.metadata !== undefined) patch.metadata = args.metadata;
    if (args.integrations !== undefined) patch.integrations = args.integrations;
    if (args.sandbox !== undefined) patch.sandbox = args.sandbox;

    await ctx.db.patch("projects", args.projectId, patch);

    return await ctx.db.get("projects", args.projectId);
  },
});

export const remove = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const user = await getCurrentUserOrThrow(ctx);

    const project = await ctx.db.get("projects", projectId);
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found");
    }

    await ctx.db.delete("projects", projectId);
    return {
      success: true,
    };
  },
});
