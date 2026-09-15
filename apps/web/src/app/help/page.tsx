import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/shell";
import { readAccountConfig } from "@/server/config";
export const metadata: Metadata = { title: "Help" };
export const dynamic = "force-dynamic";
export default function Page() {
  const shared = readAccountConfig().mode === "shared";
  return (
    <>
      <Header />
      <main id="main" className="page-wrap utility-page">
        <span className="overline">A FEW THINGS TO KNOW</span>
        <h1>Find your way around.</h1>
        <p className="utility-lead">
          Discover mods, keep your favorites close, and stay connected to their
          creators.
        </p>
        <div className="help-sections">
          <section>
            <h2>Finding mods</h2>
            <p>
              Use search with category and hero filters to narrow the catalog.
              Sort by recent updates, downloads, or likes. Each listing includes
              the original submitter, available screenshots, permissions, and a
              GameBanana link.
            </p>
            <p>
              Counts describe this import. Indexed entries may still be waiting
              for a profile check. <Link href="/status">Catalog status</Link>{" "}
              shows the current totals and refresh time.
            </p>
          </section>
          <section>
            <h2>Getting a mod</h2>
            <p>
              Open a mod and choose “View on GameBanana” for its current files,
              installation instructions, and author support links. Modlock does
              not yet install files or change your game. Source visibility
              checks do not prove file safety or current game compatibility.
            </p>
          </section>
          <section id="accounts">
            <h2>{shared ? "Your shared account" : "Testing accounts in this local preview"}</h2>
            {shared ? <p>Choose <Link href="/sign-in">Sign in</Link> to continue through BuildLock. Your existing username, profile and Steam link come with you. If you already have a BuildLock session, you return directly to Modlock. Passwords, sign-in methods and account security are managed on BuildLock.</p> : <><ol>
              <li>
                Create an account with a test email and a unique test password.
              </li>
              <li>
                Verification and recovery messages are saved to the private
                local development outbox. No email is sent externally.
              </li>
              <li>
                The developer can open the account link from{" "}
                <code>apps/web/data/mail/</code>, or use the mail command in the
                web runbook.
              </li>
              <li>
                Once verified, sign in to save mods, add private notes, manage
                your profile, and submit a report.
              </li>
            </ol>
            <p>
              This local account system is not a production or shared portfolio
              identity service.{" "}
              <Link href="/sign-up">Create a test account</Link>.
            </p>
            </>}
          </section>
          <section>
            <h2>Your saved mods</h2>
            <p>
              Select the bookmark on a listing or “Save to your library” on a
              mod page. Your <Link href="/library">saved library</Link> persists
              across sessions. Notes are private. If a listing changes after you
              save it, the library marks it as updated; this is not an
              installed-mod update.
            </p>
          </section>
          <section>
            <h2>Creators and member profiles</h2>
            <p>
              GameBanana creator pages preserve source attribution. Modlock
              member profiles are separate and private until their owner
              publishes them. A matching name, an account, or a verified email
              does not prove authorship or endorsement.
            </p>
          </section>
          <section>
            <h2>Browser tools</h2>
            <p>
              <Link href="/tools/crosshair">Crosshair studio</Link> lets you
              design, save and share an approximate crosshair preview. A shared
              link contains the design settings; anyone with that link can load
              them. These designs do not apply game commands.
            </p>
            <p>
              <Link href="/tools/keyvalues">KeyValues inspector</Link> reads
              supported Valve text files and preserves duplicate keys.{" "}
              <Link href="/tools/vpk">VPK inspector</Link> lists bounded archive
              directory metadata. Inspection files stay in your browser; neither
              tool changes your game or verifies a mod's safety.
            </p>
          </section>
          <section>
            <h2>Reporting a problem</h2>
            <p>
              Use “Report a concern” on a mod page. You will receive a private
              reference and can view status in{" "}
              <Link href="/account/reports">your reports</Link>. Reports are
              recorded in this local preview; submission does not automatically
              remove a listing or send a notice to GameBanana.
            </p>
            <p>
              For a problem with Modlock itself,{" "}
              <a
                href="https://github.com/buildlock/modlock/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                open an issue
              </a>
              . Keep passwords, account links, and private files out of public
              reports.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
