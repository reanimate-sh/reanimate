import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    externalId: v.string(),
    email: v.optional(v.string()),
    integrations: v.optional(v.any()),
    metadata: v.optional(v.any()),
    dodoCustomerId: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
    productId: v.optional(v.string()),
    subscriptionPeriodEnd: v.optional(v.string()),
    subscriptionStartedAt: v.optional(v.string()),
    nextCreditGrantAt: v.optional(v.string()),
    creditScheduleVersion: v.optional(v.number()),
  })
    .index("byExternalId", ["externalId"])
    .index("byDodoCustomerId", ["dodoCustomerId"]),

  credits: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("subscription"),
      v.literal("topup"),
      v.literal("bonus"),
      v.literal("referral")
    ),
    initialAmount: v.number(),
    remainingAmount: v.number(),
    sourceId: v.string(),
    expiresAt: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("byUserId", ["userId"])
    .index("byUserIdTypeSourceId", ["userId", "type", "sourceId"]),

  transactions: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("credit"), v.literal("debit")),
    amount: v.number(),
    source: v.union(
      v.literal("message"),
      v.literal("subscription"),
      v.literal("topup"),
      v.literal("bonus"),
      v.literal("referral")
    ),
    sourceId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }).index("byUserId", ["userId"]),

  folders: defineTable({
    name: v.string(),
    parentId: v.optional(v.id("folders")),
    userId: v.id("users"),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("byUserId", ["userId"])
    .index("byUserIdParentId", ["userId", "parentId"]),

  projects: defineTable({
    title: v.string(),
    userId: v.id("users"),
    folderId: v.optional(v.id("folders")),
    metadata: v.any(),
    integrations: v.optional(v.any()),
    sandbox: v.optional(v.any()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("byUserId", ["userId"])
    .index("byFolderId", ["folderId"]),

});
