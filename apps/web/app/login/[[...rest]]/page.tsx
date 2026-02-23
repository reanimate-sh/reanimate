import type { Metadata } from "next";
import { AuthPage } from "@/features/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <AuthPage mode="login" />;
}
