"use client";

import Link from "next/link";
import { useWatchlist } from "@/lib/watchlist";

export default function WatchlistLink() {
  const { list } = useWatchlist();
  return (
    <Link
      href="/watchlist"
      className="ml-auto inline-flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:border-accent hover:text-accent"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinejoin="round" d="M6 3h12v18l-6-4-6 4z" />
      </svg>
      Watchlist
      {list.length > 0 && (
        <span className="rounded-full bg-accent px-1.5 text-xs font-bold text-accent-ink">{list.length}</span>
      )}
    </Link>
  );
}
