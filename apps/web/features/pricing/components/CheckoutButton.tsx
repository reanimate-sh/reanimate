"use client";

import { useUser } from "@clerk/nextjs";
import { useAction } from "convex/react";
import { api } from "../../../lib/convexApi";

type Props = {
  productId: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

export function CheckoutButton({ productId, children, className, disabled }: Props) {
  const { isSignedIn } = useUser();
  const createCheckout = useAction(api.payments.createCheckout);

  async function handleClick() {
    if (disabled) {
      return;
    }
    if (!isSignedIn) {
      window.location.href = `/login`;
      return;
    }
    const session = await createCheckout({
      productId,
      returnUrl: `${window.location.origin}/app/home`,
    });
    window.location.href = session.checkout_url;
  }

  return (
    <button onClick={handleClick} className={className} disabled={disabled}>
      {children}
    </button>
  );
}
