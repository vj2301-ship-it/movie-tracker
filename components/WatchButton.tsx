"use client";

import { useWatchlist, type SavedMovie } from "@/lib/watchlist";

type Movie = Omit<SavedMovie, "addedAt">;

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
      <path strokeLinejoin="round" d="M6 3h12v18l-6-4-6 4z" />
    </svg>
  );
}

/** Small round button overlaid on a poster. */
export function WatchIconButton({ movie }: { movie: Movie }) {
  const { has, toggle } = useWatchlist();
  const saved = has(movie.id);
  return (
    <button
      type="button"
      onClick={() => toggle(movie)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
      title={saved ? "Remove from watchlist" : "Add to watchlist"}
      className={`absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full backdrop-blur transition-colors ${
        saved ? "bg-accent text-accent-ink" : "bg-black/60 text-white hover:bg-black/80"
      }`}
    >
      <BookmarkIcon filled={saved} />
    </button>
  );
}

/** Full-size button for the movie detail page. */
export function WatchButton({ movie }: { movie: Movie }) {
  const { has, toggle } = useWatchlist();
  const saved = has(movie.id);
  return (
    <button
      type="button"
      onClick={() => toggle(movie)}
      aria-pressed={saved}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors ${
        saved
          ? "border border-accent text-accent"
          : "border border-line hover:border-accent hover:text-accent"
      }`}
    >
      <BookmarkIcon filled={saved} />
      {saved ? "On your watchlist" : "Add to watchlist"}
    </button>
  );
}
