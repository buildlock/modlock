import type { Metadata } from "next";
import { AuthPage } from "@/components/auth-page";
export const metadata: Metadata = {
  title: "Reset password",
  referrer: "no-referrer",
};
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return <AuthPage mode="reset" token={(await searchParams).token} />;
}
