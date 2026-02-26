export function hasActiveSubscription(
  status: string | undefined,
  subscriptionPeriodEnd: string | undefined
): boolean {
  if (!status) return false;
  if (status === "active" || status === "paused") return true;
  if (status === "cancelled" && subscriptionPeriodEnd) {
    return new Date(subscriptionPeriodEnd) > new Date();
  }
  return false;
}
