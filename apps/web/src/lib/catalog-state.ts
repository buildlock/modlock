export const categories = [
  "All mods",
  "Skins",
  "Models",
  "HUD",
  "Sounds",
  "Animations",
  "Quality of life",
  "Other",
] as const;
export interface CatalogState {
  query: string;
  category: string;
  hero: string;
  sort: string;
  page: number;
  list: boolean;
}
export function parseCatalogState(params: URLSearchParams): CatalogState {
  const category = params.get("category") ?? "All mods";
  const page = Number(params.get("page") ?? 1);
  return {
    query: (params.get("q") ?? "").slice(0, 120),
    category: categories.includes(category as (typeof categories)[number])
      ? category
      : "All mods",
    hero: (params.get("hero") || "All heroes").slice(0, 60),
    sort: ["updated", "downloads", "likes"].includes(params.get("sort") ?? "")
      ? params.get("sort")!
      : "updated",
    page: Number.isSafeInteger(page) && page >= 1 && page <= 1000 ? page : 1,
    list: params.get("view") === "list",
  };
}
export function serializeCatalogState(state: CatalogState): string {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.category !== "All mods") params.set("category", state.category);
  if (state.hero !== "All heroes") params.set("hero", state.hero);
  if (state.sort !== "updated") params.set("sort", state.sort);
  if (state.page !== 1) params.set("page", String(state.page));
  if (state.list) params.set("view", "list");
  return params.toString();
}
