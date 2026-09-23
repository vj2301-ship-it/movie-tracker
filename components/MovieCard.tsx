import Image from "next/image";
import Link from "next/link";
import type { Movie } from "@/lib/types";
import { formatDate } from "@/lib/filters";
import { WatchIconButton } from "./WatchButton";

const IMAGE_BASE = "https://image.tmdb.org/t/p";

export default function MovieCard({
  movie,
  genreNames,
}: {
  movie: Movie;
  genreNames: Map<number, string>;
}) {
  const genres = movie.genre_ids
    .map((id) => genreNames.get(id))
    .filter(Boolean)
    .slice(0, 3);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-panel transition-colors hover:border-accent/60">
      <div className="relative overflow-hidden">
        <Link href={`/movie/${movie.id}`} className="relative block aspect-[2/3] bg-line">
          {movie.poster_path ? (
            <Image
              src={`${IMAGE_BASE}/w342${movie.poster_path}`}
              alt={`${movie.title} poster`}
              fill
              sizes="(min-width: 1280px) 16vw, (min-width: 768px) 25vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted">
              {movie.title}
            </div>
          )}
          <span className="absolute left-2 top-2 rounded-md bg-black/75 px-2 py-1 text-xs font-semibold text-white">
            {formatDate(movie.release_date)}
          </span>
        </Link>
        <WatchIconButton
          movie={{
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
          }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 font-semibold leading-snug">
          <Link href={`/movie/${movie.id}`} className="hover:text-accent">
            {movie.title}
          </Link>
        </h3>
        {genres.length > 0 && <p className="text-xs text-muted">{genres.join(" · ")}</p>}
        <Link
          href={`/movie/${movie.id}#trailer`}
          className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:border-accent hover:text-accent"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-current">
            <path d="M8 5v14l11-7z" />
          </svg>
          Trailer
        </Link>
      </div>
    </article>
  );
}
