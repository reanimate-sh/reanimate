import { DatabaseWriter } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export async function allotCredits(
  db: DatabaseWriter,
  args: {
    userId: Id<"users">;
    type: "subscription" | "topup" | "bonus" | "referral";
    amount: number;
    sourceId: string;
    expiresAt?: string;
    metadata?: unknown;
  }
) {
  const existing = await db
    .query("credits")
    .withIndex("byUserIdTypeSourceId", (q) =>
      q
        .eq("userId", args.userId)
        .eq("type", args.type)
        .eq("sourceId", args.sourceId)
    )
    .first();

  if (existing) return false;

  await db.insert("credits", {
    userId: args.userId,
    type: args.type,
    initialAmount: args.amount,
    remainingAmount: args.amount,
    sourceId: args.sourceId,
    expiresAt: args.expiresAt,
    metadata: args.metadata,
  });

  return true;
}
