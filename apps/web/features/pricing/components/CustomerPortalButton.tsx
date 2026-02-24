"use client";

import { useAction } from "convex/react";
import { api } from "../../../lib/convexApi";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function CustomerPortalButton({ children, className }: Props) {
  const getCustomerPortal = useAction(api.payments.getCustomerPortal);

  async function handleClick() {
    const portal = await getCustomerPortal({ sendEmail: false });
    window.location.href = portal.portal_url;
  }

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
