import type { Metadata } from "next";
import { AuthPage } from "@/components/auth-page";
export const metadata: Metadata = { title: "Recover account" };
export const dynamic = "force-dynamic";
export default function Page() {
  return <AuthPage mode="forgot" />;
}
