"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-line bg-panel p-8 text-center">
      <h2 className="text-xl font-semibold">Couldn&apos;t load movies</h2>
      <p className="text-muted">TMDB may be unreachable, or the token may be invalid.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-ink"
      >
        Try again
      </button>
    </div>
  );
}
