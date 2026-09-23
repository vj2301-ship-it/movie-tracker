import "server-only";
import type {
  DiscoverResponse,
  Genre,
  MovieDetails,
  Person,
  ReleaseDateEntry,
  Video,
} from "./types";
import { addDays } from "./filters";

const BASE_URL = "https://api.themoviedb.org/3";
export const IMAGE_BASE = "https://image.tmdb.org/t/p";

const HOUR = 60 * 60;

export class TmdbConfigError extends Error {}

async function tmdb<T>(
  path: string,
  params: Record<string, string | undefined> = {},
  revalidate = 6 * HOUR,
): Promise<T> {
  const token = process.env.TMDB_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;
  if (!token && !apiKey) {
    throw new TmdbConfigError(
      "Missing TMDB credentials. Set TMDB_TOKEN (or TMDB_API_KEY) in .env.local.",
    );
  }

  const url = new URL(BASE_URL + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, v);
  }
  if (!token && apiKey) url.searchParams.set("api_key", apiKey);

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`TMDB ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export interface DiscoverFilters {
  from: string;
  to: string;
  genres: number[];
  actors: number[];
  sort: "date" | "popularity";
  page: number;
}

export function discoverMovies(f: DiscoverFilters) {
  return tmdb<DiscoverResponse>("/discover/movie", {
    region: "US",
    language: "en-US",
    with_original_language: "en",
    // 2 = limited theatrical, 3 = theatrical
    with_release_type: "2|3",
    "release_date.gte": f.from,
    "release_date.lte": f.to,
    // skip re-releases of old films (anniversary screenings etc.): the first
    // release must be within a year of the window, allowing for festival premieres
    "primary_release_date.gte": addDays(f.from, -365),
    // pipe = OR: match any selected genre / actor
    with_genres: f.genres.join("|") || undefined,
    with_cast: f.actors.join("|") || undefined,
    sort_by: f.sort === "popularity" ? "popularity.desc" : "primary_release_date.asc",
    include_adult: "false",
    page: String(f.page),
  });
}

export async function getGenres(): Promise<Genre[]> {
  const data = await tmdb<{ genres: Genre[] }>(
    "/genre/movie/list",
    { language: "en-US" },
    24 * HOUR,
  );
  return data.genres;
}

export async function searchPeople(query: string): Promise<Person[]> {
  const data = await tmdb<{ results: Person[] }>(
    "/search/person",
    { query, include_adult: "false", language: "en-US" },
    24 * HOUR,
  );
  return data.results
    .filter((p) => p.known_for_department === "Acting")
    .slice(0, 8);
}

export function getPerson(id: number) {
  return tmdb<Person>(`/person/${id}`, { language: "en-US" }, 24 * HOUR);
}

export function getMovieDetails(id: number) {
  return tmdb<MovieDetails>(`/movie/${id}`, {
    language: "en-US",
    append_to_response: "videos,credits,reviews,release_dates",
  });
}

/** Best YouTube trailer: official trailers first, then any trailer, then teasers. */
export function pickTrailer(videos: Video[]): Video | undefined {
  const yt = videos.filter((v) => v.site === "YouTube");
  const rank = (v: Video) =>
    (v.type === "Trailer" ? 0 : v.type === "Teaser" ? 2 : 4) + (v.official ? 0 : 1);
  return yt
    .filter((v) => v.type === "Trailer" || v.type === "Teaser")
    .sort((a, b) => rank(a) - rank(b))[0];
}

type ReleaseDates = MovieDetails["release_dates"];

/**
 * US theatrical (or limited) release with its certification. With a window,
 * prefers the earliest date inside it (the one that matched the discover filter).
 */
export function getUsRelease(
  releaseDates: ReleaseDates,
  window?: { from: string; to: string },
): ReleaseDateEntry | undefined {
  const us = releaseDates.results.find((r) => r.iso_3166_1 === "US");
  if (!us) return undefined;
  const theatrical = us.release_dates.filter((d) => d.type === 2 || d.type === 3);
  const pool = [...(theatrical.length ? theatrical : us.release_dates)].sort((a, b) =>
    a.release_date.localeCompare(b.release_date),
  );
  if (window) {
    const inWindow = pool.find((d) => {
      const day = d.release_date.slice(0, 10);
      return day >= window.from && day <= window.to;
    });
    if (inWindow) return inWindow;
  }
  return pool[0];
}

/** US release date (YYYY-MM-DD) for a list card, or undefined if TMDB has none. */
export async function getUsReleaseDate(
  id: number,
  window: { from: string; to: string },
): Promise<string | undefined> {
  try {
    const data = await tmdb<ReleaseDates>(`/movie/${id}/release_dates`, {}, 12 * HOUR);
    return getUsRelease(data, window)?.release_date.slice(0, 10);
  } catch {
    return undefined;
  }
}

export function posterUrl(path: string | null, size: "w342" | "w500" | "w780" = "w342") {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}
