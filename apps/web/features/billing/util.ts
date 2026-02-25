export function hasActiveSubscription(
  status: string | undefined | null,
  subscriptionPeriodEnd: string | undefined | null
): boolean {
  if (!status) return false;
  if (status === "active" || status === "paused") return true;
  if (status === "cancelled" && subscriptionPeriodEnd) {
    return new Date(subscriptionPeriodEnd) > new Date();
  }
  return false;
}
