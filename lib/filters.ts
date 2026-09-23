export type View = "upcoming" | "now" | "custom";

export interface ParsedFilters {
  view: View;
  from: string;
  to: string;
  genres: number[];
  actors: number[];
  sort: "date" | "popularity";
  page: number;
}

type RawParams = { [key: string]: string | string[] | undefined };

/** Today's date (YYYY-MM-DD) in US Eastern time. */
export function todayUS(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const ids = (v: string | string[] | undefined) =>
  (one(v) ?? "")
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);

const isDate = (v: string | undefined): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

export function parseFilters(sp: RawParams): ParsedFilters {
  const today = todayUS();
  const rawView = one(sp.view);
  const view: View = rawView === "now" || rawView === "custom" ? rawView : "upcoming";

  let from: string;
  let to: string;
  if (view === "now") {
    from = addDays(today, -30);
    to = today;
  } else if (view === "custom") {
    const f = one(sp.from);
    const t = one(sp.to);
    from = isDate(f) ? f : today;
    to = isDate(t) ? t : addDays(from, 180);
  } else {
    from = today;
    to = addDays(today, 180);
  }

  const page = Math.min(Math.max(Number(one(sp.page)) || 1, 1), 500);

  return {
    view,
    from,
    to,
    genres: ids(sp.genres),
    actors: ids(sp.actors),
    sort: one(sp.sort) === "popularity" ? "popularity" : "date",
    page,
  };
}

export function formatDate(iso: string | undefined | null): string {
  if (!iso) return "TBA";
  const d = new Date(iso.slice(0, 10) + "T00:00:00Z");
  if (isNaN(d.getTime())) return "TBA";
  return d.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
