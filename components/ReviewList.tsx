import type { Review } from "@/lib/types";
import { formatDate } from "@/lib/filters";

const EXCERPT = 420;

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line p-6 text-center text-muted">
        No reviews yet. Early reviews usually appear once critics&apos; embargoes lift, often a
        few days before release.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((r) => {
        const long = r.content.length > EXCERPT;
        const rating = r.author_details.rating;
        return (
          <li key={r.id} className="rounded-xl border border-line bg-panel p-5">
            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-semibold">{r.author}</span>
              {rating != null && (
                <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-bold text-accent-ink">
                  ★ {rating}/10
                </span>
              )}
              <span className="text-sm text-muted">{formatDate(r.created_at)}</span>
            </div>
            {long ? (
              <details className="group">
                <summary className="cursor-pointer list-none whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                  <span className="group-open:hidden">
                    {r.content.slice(0, EXCERPT).trimEnd()}…{" "}
                    <span className="font-medium text-accent">Read more</span>
                  </span>
                  <span className="hidden font-medium text-accent group-open:inline">Show less</span>
                </summary>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                  {r.content}
                </p>
              </details>
            ) : (
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                {r.content}
              </p>
            )}
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs text-muted hover:text-accent"
            >
              View on TMDB ↗
            </a>
          </li>
        );
      })}
    </ul>
  );
}
