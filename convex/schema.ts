import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    externalId: v.string(),
    email: v.optional(v.string()),
    dodoCustomerId: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
    productId: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.string()),
  })
    .index("byExternalId", ["externalId"])
    .index("byDodoCustomerId", ["dodoCustomerId"]),
});
