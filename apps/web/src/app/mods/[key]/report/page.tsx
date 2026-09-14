import { randomUUID } from "node:crypto";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/shell";
import { ReportForm } from "@/components/report-form";
import { requirePageSession } from "@/server/session";
import { getCatalog } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  await requirePageSession(`/mods/${key}/report`);
  const mod = (await getCatalog())?.mods.find((m) => m.key === key);
  if (!mod) notFound();
  return (
    <>
      <Header />
      <main id="main" className="page-wrap report-page">
        <Link className="text-link" href={`/mods/${key}`}>
          ← Back to mod
        </Link>
        <span className="overline">LOOKING OUT FOR THE COMMUNITY</span>
        <h1>Report a concern.</h1>
        <p className="report-target">
          About <strong>{mod.title}</strong>
        </p>
        <ReportForm modKey={key} requestKey={randomUUID()} />
      </main>
      <Footer />
    </>
  );
}
