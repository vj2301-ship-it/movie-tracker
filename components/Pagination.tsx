import Link from "next/link";

export default function Pagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: Record<string, string | string[] | undefined>;
}) {
  // TMDB caps discover results at page 500
  const last = Math.min(totalPages, 500);
  if (last <= 1) return null;

  function href(p: number) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (k !== "page" && typeof v === "string") sp.set(k, v);
    }
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/?${qs}` : "/";
  }

  const btn =
    "rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent";
  const off = "rounded-lg border border-line px-4 py-2 text-sm text-muted opacity-40";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-4">
      {page > 1 ? (
        <Link href={href(page - 1)} className={btn}>
          ← Previous
        </Link>
      ) : (
        <span className={off}>← Previous</span>
      )}
      <span className="text-sm text-muted">
        Page {page} of {last}
      </span>
      {page < last ? (
        <Link href={href(page + 1)} className={btn}>
          Next →
        </Link>
      ) : (
        <span className={off}>Next →</span>
      )}
    </nav>
  );
}
