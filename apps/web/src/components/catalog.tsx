"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  AudioLines,
  Box,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Grid2X2,
  Heart,
  Layers3,
  List,
  Paintbrush,
  Search,
  SlidersHorizontal,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import type { Mod } from "@/lib/gamebanana";
import {
  parseCatalogState,
  serializeCatalogState,
  type CatalogState,
} from "@/lib/catalog-state";
export type ModListing = Pick<
  Mod,
  | "key"
  | "title"
  | "description"
  | "category"
  | "categoryName"
  | "hero"
  | "model"
  | "modifiedAt"
  | "downloads"
  | "likes"
  | "images"
> & { submitter: { name: string; url: string | null } };
import { ModImage } from "./mod-image";
import { SaveModButton } from "./save-mod";
const categoryOptions = [
  { name: "All mods", icon: Grid2X2 },
  { name: "Skins", icon: Paintbrush },
  { name: "Models", icon: Box },
  { name: "HUD", icon: Layers3 },
  { name: "Sounds", icon: AudioLines },
  { name: "Animations", icon: Sparkles },
  { name: "Quality of life", icon: WandSparkles },
  { name: "Other", icon: SlidersHorizontal },
];
export const compact = (n: number | null) =>
  n === null
    ? "—"
    : Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(n);
function Card({
  mod,
  list,
  saved,
  signedIn,
}: {
  mod: ModListing;
  list: boolean;
  saved: boolean;
  signedIn: boolean;
}) {
  return (
    <article className={`mod-card${list ? " mod-row" : ""}`}>
      <Link
        href={`/mods/${mod.key}`}
        className="mod-art"
        aria-label={`View ${mod.title}`}
      >
        <ModImage
          src={mod.images[0]?.thumbnail}
          alt={mod.images[0]?.caption || mod.title}
        />
        <span className="art-category">{mod.categoryName}</span>
        <span className="open-art">
          <ArrowRight size={18} />
        </span>
      </Link>
      <div className="mod-card-body">
        <div className="mod-eyebrow">
          {mod.category}
          <span>GAMEBANANA</span>
        </div>
        <h3>
          <Link href={`/mods/${mod.key}`}>{mod.title}</Link>
        </h3>
        <p className="mod-author">
          Submitted by{" "}
          <a
            href={
              mod.submitter.url
                ? `/creators/gamebanana-${mod.submitter.url.split("/").at(-1)}`
                : undefined
            }
          >
            {mod.submitter.name}
          </a>
        </p>
        <div className="mod-stats">
          <span>
            <Download size={13} />
            {compact(mod.downloads)}
          </span>
          <span>
            <Heart size={13} />
            {compact(mod.likes)}
          </span>
          <SaveModButton
            modKey={mod.key}
            initialSaved={saved}
            signedIn={signedIn}
            compact
          />
        </div>
      </div>
    </article>
  );
}
export function CatalogBrowser({
  mods,
  savedKeys = [],
  signedIn = false,
}: {
  mods: ModListing[];
  savedKeys?: string[];
  signedIn?: boolean;
}) {
  const searchParams = useSearchParams();
  const state = parseCatalogState(new URLSearchParams(searchParams.toString()));
  const { category, query, sort, page, list } = state;
  const hero = mods.some((mod) => mod.hero === state.hero)
    ? state.hero
    : "All heroes";
  const [filtersOpen, setFiltersOpen] = useState(false);
  function change(partial: Partial<CatalogState>) {
    const current = parseCatalogState(
      new URLSearchParams(window.location.search),
    );
    const serialized = serializeCatalogState({ ...current, ...partial });
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${serialized ? `?${serialized}` : ""}${window.location.hash}`,
    );
  }
  const setCategory = (category: string) => change({ category, page: 1 });
  const setHero = (hero: string) => change({ hero, page: 1 });
  const setQuery = (query: string) => change({ query, page: 1 });
  const setSort = (sort: string) => change({ sort, page: 1 });
  const setPage = (page: number) => change({ page });
  const setList = (list: boolean) => change({ list });
  const heroes = useMemo(
    () =>
      [...new Set(mods.flatMap((mod) => (mod.hero ? [mod.hero] : [])))].sort(),
    [mods],
  );
  const counts = useMemo(
    () =>
      Object.fromEntries(
        categoryOptions.map((item) => [
          item.name,
          mods.filter(
            (mod) => item.name === "All mods" || mod.category === item.name,
          ).length,
        ]),
      ),
    [mods],
  );
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return mods
      .filter(
        (mod) =>
          (category === "All mods" || mod.category === category) &&
          (hero === "All heroes" || mod.hero === hero) &&
          `${mod.title} ${mod.description} ${mod.submitter.name} ${mod.categoryName}`
            .toLowerCase()
            .includes(needle),
      )
      .sort((a, b) =>
        sort === "downloads"
          ? (b.downloads ?? -1) - (a.downloads ?? -1)
          : sort === "likes"
            ? (b.likes ?? -1) - (a.likes ?? -1)
            : (b.modifiedAt ?? "").localeCompare(a.modifiedAt ?? "") ||
              a.key.localeCompare(b.key),
      );
  }, [mods, category, hero, query, sort]);
  const pages = Math.max(1, Math.ceil(results.length / 24)),
    current = Math.min(page, pages);
  const active = query || category !== "All mods" || hero !== "All heroes";
  function reset() {
    setQuery("");
    setCategory("All mods");
    setHero("All heroes");
    setPage(1);
  }
  return (
    <section id="catalog" className="catalog-section">
      <div className="section-title">
        <div>
          <span className="overline">THE COMMUNITY WORKSHOP</span>
          <h2>Find your next upgrade.</h2>
        </div>
        <p>{mods.length.toLocaleString()} mods to make it yours.</p>
      </div>
      <div className="catalog-layout">
        <aside className={`filters${filtersOpen ? " is-open" : ""}`}>
          <div className="filter-heading">CATEGORIES</div>
          <div className="category-list">
            {categoryOptions.map(({ name, icon: Icon }) => (
              <button
                key={name}
                className={category === name ? "selected" : ""}
                onClick={() => {
                  setCategory(name);
                  setPage(1);
                }}
                aria-pressed={category === name}
              >
                <Icon size={17} />
                <span>{name}</span>
                <span className="filter-count">{counts[name]}</span>
              </button>
            ))}
          </div>
          <div className="hero-filter">
            <label htmlFor="hero">FILTER BY HERO</label>
            <div className="select-wrap">
              <select
                id="hero"
                value={hero}
                onChange={(e) => {
                  setHero(e.target.value);
                  setPage(1);
                }}
              >
                <option>All heroes</option>
                {heroes.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
              <ChevronDown size={15} />
            </div>
          </div>
          <div className="source-note">
            <span className="source-dot" />
            <div>
              <strong>Direct from GameBanana</strong>
              <p>Original creators. Original sources. Every mod links back.</p>
              <a
                href="https://gamebanana.com/games/20948"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit the community <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </aside>
        <div className="results-column">
          <div className="catalog-toolbar">
            <label className="search-box">
              <Search size={18} />
              <input
                aria-label="Search mods"
                maxLength={120}
                placeholder="Search mods, heroes, creators…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setPage(1);
                  }}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </label>
            <button
              className="mobile-filter icon-button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-expanded={filtersOpen}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal size={19} />
            </button>
            <div className="sort-wrap">
              <ArrowDown size={15} />
              <select
                aria-label="Sort mods"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                <option value="updated">Recently updated</option>
                <option value="downloads">Most downloaded</option>
                <option value="likes">Most liked</option>
              </select>
            </div>
            <div className="view-toggle">
              <button
                className={!list ? "active" : ""}
                aria-label="Grid view"
                aria-pressed={!list}
                onClick={() => setList(false)}
              >
                <Grid2X2 size={17} />
              </button>
              <button
                className={list ? "active" : ""}
                aria-label="List view"
                aria-pressed={list}
                onClick={() => setList(true)}
              >
                <List size={18} />
              </button>
            </div>
          </div>
          <div className="results-meta">
            <p aria-live="polite">
              {results.length.toLocaleString()}{" "}
              {results.length === 1 ? "result" : "results"}
              {category !== "All mods" ? ` in ${category}` : ""}
              {hero !== "All heroes" ? ` · ${hero}` : ""}
            </p>
            {active ? (
              <button onClick={reset}>
                Clear filters <X size={13} />
              </button>
            ) : (
              <span>
                <Check size={13} /> Source profiles checked
              </span>
            )}
          </div>
          {results.length ? (
            <>
              <div className={list ? "mod-list" : "mod-grid"}>
                {results.slice((current - 1) * 24, current * 24).map((mod) => (
                  <Card
                    key={mod.key}
                    mod={mod}
                    list={list}
                    saved={savedKeys.includes(mod.key)}
                    signedIn={signedIn}
                  />
                ))}
              </div>
              <div className="pagination">
                <span>
                  Showing {(current - 1) * 24 + 1}–
                  {Math.min(current * 24, results.length)} of {results.length}
                </span>
                <div>
                  <button
                    disabled={current === 1}
                    onClick={() => setPage(current - 1)}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={17} />
                  </button>
                  <span>
                    {current} / {pages}
                  </span>
                  <button
                    disabled={current === pages}
                    onClick={() => {
                      setPage(current + 1);
                      document
                        .getElementById("catalog")
                        ?.scrollIntoView({ block: "start" });
                    }}
                    aria-label="Next page"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <Search size={30} />
              <h3>No mods match those filters.</h3>
              <p>Try another hero, creator, or category.</p>
              <button className="button" onClick={reset}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
