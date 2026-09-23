"use client";

import Image from "next/image";
import Link from "next/link";
import { useWatchlist, type SavedMovie } from "@/lib/watchlist";
import { formatDate, todayUS } from "@/lib/filters";

const IMAGE_BASE = "https://image.tmdb.org/t/p";

function daysUntil(date: string, today: string) {
  const ms = Date.parse(date.slice(0, 10) + "T00:00:00Z") - Date.parse(today + "T00:00:00Z");
  return Math.round(ms / 86_400_000);
}

function countdown(date: string, today: string) {
  if (!date) return "Date TBA";
  const d = daysUntil(date, today);
  if (d === 0) return "Out today";
  if (d === 1) return "Tomorrow";
  if (d < 0) return `Released ${formatDate(date)}`;
  return `In ${d} days`;
}

export default function WatchlistPage() {
  const { list, remove } = useWatchlist();
  const today = todayUS();

  const byDate = (a: SavedMovie, b: SavedMovie) =>
    (a.release_date || "9999").localeCompare(b.release_date || "9999");
  const upcoming = list.filter((m) => !m.release_date || m.release_date > today).sort(byDate);
  const released = list
    .filter((m) => m.release_date && m.release_date <= today)
    .sort((a, b) => byDate(b, a));

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl font-bold">Your watchlist</h1>
        <p className="text-sm text-muted">Saved on this device only</p>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="text-lg font-medium">Nothing saved yet</p>
          <p className="mt-1 text-muted">
            Tap the bookmark on any movie poster to track its release here.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-lg bg-accent px-4 py-2 font-semibold text-accent-ink"
          >
            Browse upcoming releases
          </Link>
        </div>
      ) : (
        <>
          <Section title="Coming soon" movies={upcoming} today={today} onRemove={remove} />
          <Section title="Out now" movies={released} today={today} onRemove={remove} />
        </>
      )}
    </div>
  );
}

function Section({
  title,
  movies,
  today,
  onRemove,
}: {
  title: string;
  movies: SavedMovie[];
  today: string;
  onRemove: (id: number) => void;
}) {
  if (movies.length === 0) return null;
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">
        {title} <span className="font-normal text-muted">({movies.length})</span>
      </h2>
      <ul className="space-y-3">
        {movies.map((m) => {
          const d = m.release_date ? daysUntil(m.release_date, today) : null;
          const soon = d !== null && d >= 0 && d <= 7;
          return (
            <li
              key={m.id}
              className="flex items-center gap-4 rounded-xl border border-line bg-panel p-3"
            >
              <Link
                href={`/movie/${m.id}`}
                className="relative aspect-[2/3] w-14 shrink-0 overflow-hidden rounded-md bg-line"
              >
                {m.poster_path && (
                  <Image
                    src={`${IMAGE_BASE}/w185${m.poster_path}`}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/movie/${m.id}`} className="font-semibold hover:text-accent">
                  {m.title}
                </Link>
                <p className="text-sm text-muted">{formatDate(m.release_date)}</p>
              </div>
              <span
                className={`hidden rounded-full px-3 py-1 text-sm font-medium sm:inline ${
                  soon ? "bg-accent text-accent-ink" : "text-muted"
                }`}
              >
                {countdown(m.release_date, today)}
              </span>
              <Link
                href={`/movie/${m.id}#trailer`}
                className="rounded-lg border border-line px-3 py-1.5 text-sm hover:border-accent hover:text-accent"
              >
                ▶ Trailer
              </Link>
              <button
                type="button"
                onClick={() => onRemove(m.id)}
                aria-label={`Remove ${m.title}`}
                title="Remove"
                className="rounded-lg px-2 py-1.5 text-muted hover:bg-line hover:text-foreground"
              >
                ✕
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
