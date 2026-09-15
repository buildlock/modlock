import type { Metadata } from "next";
import { AuthPage } from "@/components/auth-page";
export const metadata: Metadata = { title: "Create account" };
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return <AuthPage mode="sign-up" next={(await searchParams).next} />;
}
