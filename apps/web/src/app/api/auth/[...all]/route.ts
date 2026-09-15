import { accountHandler } from "@/server/auth-http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export { accountHandler as GET, accountHandler as POST };
