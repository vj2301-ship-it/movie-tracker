"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Genre } from "@/lib/types";
import type { ParsedFilters, View } from "@/lib/filters";

export interface ActorChip {
  id: number;
  name: string;
}

interface Props {
  genres: Genre[];
  filters: ParsedFilters;
  selectedActors: ActorChip[];
}

type Next = Partial<Omit<ParsedFilters, "actors">> & { actors?: ActorChip[] };

export default function FilterBar({ genres, filters, selectedActors }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function navigate(qs: string) {
    startTransition(() => router.push(qs ? `/?${qs}` : "/", { scroll: false }));
  }

  // Any filter change drops the page param, so results restart at page 1.
  function apply(next: Next) {
    const merged = { ...filters, ...next };
    const actors = next.actors ?? selectedActors;
    const p = new URLSearchParams();
    if (merged.view !== "upcoming") p.set("view", merged.view);
    if (merged.view === "custom") {
      p.set("from", merged.from);
      p.set("to", merged.to);
    }
    if (merged.genres.length) p.set("genres", merged.genres.join(","));
    if (actors.length) p.set("actors", actors.map((a) => a.id).join(","));
    if (merged.sort !== "date") p.set("sort", merged.sort);
    navigate(p.toString());
  }

  function toggleGenre(id: number) {
    const has = filters.genres.includes(id);
    apply({ genres: has ? filters.genres.filter((g) => g !== id) : [...filters.genres, id] });
  }

  const views: { key: View; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "now", label: "Now playing" },
    { key: "custom", label: "Custom dates" },
  ];

  const hasFilters =
    filters.genres.length > 0 ||
    selectedActors.length > 0 ||
    filters.view !== "upcoming" ||
    filters.sort !== "date";

  return (
    <section
      aria-label="Filters"
      aria-busy={pending}
      className={`space-y-5 rounded-2xl border border-line bg-panel p-4 transition-opacity sm:p-5 ${pending ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label>Release window</Label>
          <div className="inline-flex flex-wrap rounded-lg border border-line p-1">
            {views.map((v) => (
              <button
                key={v.key}
                type="button"
                aria-pressed={filters.view === v.key}
                onClick={() => apply({ view: v.key })}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  filters.view === v.key
                    ? "bg-accent text-accent-ink"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {filters.view === "custom" && (
          <div className="flex flex-wrap items-end gap-3">
            <DateField
              label="From"
              value={filters.from}
              onChange={(from) => apply({ from, to: filters.to < from ? from : filters.to })}
            />
            <DateField
              label="To"
              value={filters.to}
              min={filters.from}
              onChange={(to) => apply({ to })}
            />
          </div>
        )}

        <label className="block">
          <Label>Sort by</Label>
          <select
            value={filters.sort}
            onChange={(e) => apply({ sort: e.target.value as ParsedFilters["sort"] })}
            className="rounded-lg border border-line bg-background px-3 py-2 text-sm"
          >
            <option value="date">Release date</option>
            <option value="popularity">Most popular</option>
          </select>
        </label>

        <ActorSearch selected={selectedActors} onChange={(actors) => apply({ actors })} />

        {hasFilters && (
          <button
            type="button"
            onClick={() => navigate("")}
            className="pb-2 text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            Reset all
          </button>
        )}
      </div>

      <div>
        <Label>Genres {filters.genres.length > 1 && <span className="normal-case tracking-normal">(any of)</span>}</Label>
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => {
            const on = filters.genres.includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleGenre(g.id)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  on
                    ? "border-accent bg-accent text-accent-ink"
                    : "border-line text-muted hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
      {children}
    </span>
  );
}

function DateField(props: {
  label: string;
  value: string;
  min?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <Label>{props.label}</Label>
      <input
        type="date"
        value={props.value}
        min={props.min}
        onChange={(e) => e.target.value && props.onChange(e.target.value)}
        className="rounded-lg border border-line bg-background px-3 py-2 text-sm [color-scheme:light_dark]"
      />
    </label>
  );
}

function ActorSearch({
  selected,
  onChange,
}: {
  selected: ActorChip[];
  onChange: (actors: ActorChip[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ActorChip[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/people?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setResults(data);
          setActive(0);
          setOpen(true);
        }
      } catch {
        // aborted or network error: keep previous results
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function pick(p: ActorChip) {
    if (!selected.some((s) => s.id === p.id)) onChange([...selected, { id: p.id, name: p.name }]);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  const options =
    query.trim().length < 2 ? [] : results.filter((r) => !selected.some((s) => s.id === r.id));

  return (
    <div ref={boxRef} className="relative min-w-60 flex-1">
      <Label>Actors {selected.length > 1 && <span className="normal-case tracking-normal">(any of)</span>}</Label>
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-line bg-background px-2 py-1.5 focus-within:border-accent">
        {selected.map((a) => (
          <span
            key={a.id}
            className="inline-flex items-center gap-1 rounded-full bg-accent/15 py-0.5 pl-2.5 pr-1 text-sm"
          >
            {a.name}
            <button
              type="button"
              aria-label={`Remove ${a.name}`}
              onClick={() => onChange(selected.filter((s) => s.id !== a.id))}
              className="rounded-full px-1.5 text-muted hover:bg-accent/25 hover:text-foreground"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          role="combobox"
          aria-label="Search actors"
          aria-expanded={open && options.length > 0}
          aria-controls="actor-options"
          placeholder={selected.length ? "Add another…" : "Search an actor, e.g. Zendaya"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => options.length > 0 && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => Math.min(i + 1, options.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && options[active]) {
              e.preventDefault();
              pick(options[active]);
            } else if (e.key === "Escape") {
              setOpen(false);
            } else if (e.key === "Backspace" && !query && selected.length) {
              onChange(selected.slice(0, -1));
            }
          }}
          className="min-w-32 flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted"
        />
      </div>
      {open && options.length > 0 && (
        <ul
          id="actor-options"
          role="listbox"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-line bg-panel py-1 shadow-xl"
        >
          {options.map((p, i) => (
            <li
              key={p.id}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(p);
              }}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer px-3 py-2 text-sm ${i === active ? "bg-accent/15" : ""}`}
            >
              {p.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
