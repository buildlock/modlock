import type { Metadata } from "next";
import { Header, Footer } from "@/components/shell";
export const metadata: Metadata = { title: "About Modlock" };
export default function About() {
  return (
    <>
      <Header active="about" />
      <main id="main" className="page-wrap about-page">
        <span className="overline">A HOME FOR DEADLOCK MODDING</span>
        <h1>Your game. Your own way.</h1>
        <p>
          Modlock helps you discover the skins, models, HUD changes, and sounds
          made by the Deadlock community. This first website brings GameBanana
          listings into one searchable catalog, while keeping the original
          creators and sources visible.
        </p>
        <h2>Discover here. Download at the source.</h2>
        <p>
          Our catalog imports public submission information from{" "}
          <a
            href="https://gamebanana.com/games/20948"
            target="_blank"
            rel="noopener noreferrer"
          >
            GameBanana
          </a>
          . Images are served by GameBanana. Mod files are not mirrored or
          rehosted. The submission page is the place to find current downloads,
          instructions, permissions, and ways to support the author.
        </p>
        <h2>A growing catalog</h2>
        <p>
          The homepage shows how many listings are available and when they were
          refreshed. Each listing is checked against its source profile before
          it appears. Restricted, obsolete, and content-rated submissions are
          excluded from this preview. An index entry count is not a count of
          downloadable or compatible mods.
        </p>
        <h2>What comes next</h2>
        <p>
          A desktop companion will bring one-click installation, recoverable
          changes, and a CFG editor. Later, creator ModPacks will combine a
          player’s chosen mods and configuration in one versioned collection.
          Those features are being planned; this website does not install
          anything or change game files.
        </p>
        <h2>Community made</h2>
        <p>
          Modlock is an independent community project, not affiliated with Valve
          or GameBanana. Deadlock belongs to Valve. Mods and their images belong
          to their respective creators. For corrections or removal requests,{" "}
          <a
            href="https://github.com/buildlock/modlock/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            open an issue in the Modlock repository
          </a>
          .
        </p>
      </main>
      <Footer />
    </>
  );
}
