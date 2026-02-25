import { DatabaseWriter } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export async function logTransaction(
  db: DatabaseWriter,
  args: {
    userId: Id<"users">;
    type: "credit" | "debit";
    amount: number;
    source: "message" | "subscription" | "topup" | "bonus" | "referral";
    sourceId?: string;
    metadata?: unknown;
  }
) {
  await db.insert("transactions", {
    userId: args.userId,
    type: args.type,
    amount: args.amount,
    source: args.source,
    sourceId: args.sourceId,
    metadata: args.metadata,
  });
}
