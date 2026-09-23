import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReviewList from "@/components/ReviewList";
import SetupNotice from "@/components/SetupNotice";
import { WatchButton } from "@/components/WatchButton";
import { formatDate } from "@/lib/filters";
import {
  getMovieDetails,
  getUsRelease,
  pickTrailer,
  posterUrl,
  TmdbConfigError,
} from "@/lib/tmdb";
import type { MovieDetails } from "@/lib/types";

async function load(idParam: string): Promise<MovieDetails | "setup"> {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) notFound();
  try {
    return await getMovieDetails(id);
  } catch (err) {
    if (err instanceof TmdbConfigError) return "setup";
    if (err instanceof Error && err.message.includes(" 404 ")) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: PageProps<"/movie/[id]">): Promise<Metadata> {
  const movie = await load((await params).id);
  if (movie === "setup") return {};
  return { title: `${movie.title} | US Release Tracker`, description: movie.overview };
}

export default async function MoviePage({ params }: PageProps<"/movie/[id]">) {
  const movie = await load((await params).id);
  if (movie === "setup") return <SetupNotice />;

  const trailer = pickTrailer(movie.videos.results);
  const us = getUsRelease(movie.release_dates);
  const releaseDate = us?.release_date ?? movie.release_date;
  const director = movie.credits.crew.filter((c) => c.job === "Director").map((c) => c.name);
  const cast = movie.credits.cast.slice(0, 12);
  const poster = posterUrl(movie.poster_path, "w500");
  const backdrop = posterUrl(movie.backdrop_path, "w780");

  return (
    <article className="space-y-10">
      <Link href="/" className="text-sm text-muted hover:text-foreground">
        ← Back to releases
      </Link>

      <header className="relative overflow-hidden rounded-2xl border border-line bg-panel">
        {backdrop && (
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-20 blur-sm"
          />
        )}
        <div className="relative flex flex-col gap-6 p-5 sm:flex-row sm:p-8">
          <div className="relative aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-xl bg-line sm:w-56">
            {poster && (
              <Image src={poster} alt={`${movie.title} poster`} fill sizes="224px" className="object-cover" />
            )}
          </div>
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">{movie.title}</h1>
              {movie.tagline && <p className="mt-1 italic text-muted">{movie.tagline}</p>}
            </div>
            <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Fact label="US release" value={formatDate(releaseDate)} />
              {us?.certification && <Fact label="Rated" value={us.certification} />}
              {movie.runtime ? <Fact label="Runtime" value={`${movie.runtime} min`} /> : null}
              {director.length > 0 && <Fact label="Director" value={director.join(", ")} />}
              <Fact label="Status" value={movie.status} />
            </dl>
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((g) => (
                <Link
                  key={g.id}
                  href={`/?genres=${g.id}`}
                  className="rounded-full border border-line px-3 py-1 text-sm text-muted hover:border-accent hover:text-accent"
                >
                  {g.name}
                </Link>
              ))}
            </div>
            {movie.overview && <p className="max-w-3xl leading-relaxed">{movie.overview}</p>}
            <div className="flex flex-wrap gap-3 text-sm">
              <WatchButton
                movie={{
                  id: movie.id,
                  title: movie.title,
                  poster_path: movie.poster_path,
                  release_date: releaseDate?.slice(0, 10) ?? "",
                }}
              />
              {trailer && (
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-ink hover:opacity-90"
                >
                  ▶ Watch trailer on YouTube
                </a>
              )}
              {movie.imdb_id && (
                <a
                  href={`https://www.imdb.com/title/${movie.imdb_id}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-line px-4 py-2 hover:border-accent"
                >
                  IMDb ↗
                </a>
              )}
              {movie.homepage && (
                <a
                  href={movie.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-line px-4 py-2 hover:border-accent"
                >
                  Official site ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <section id="trailer" className="scroll-mt-6 space-y-4">
        <h2 className="text-2xl font-semibold">Trailer</h2>
        {trailer ? (
          <div className="aspect-video overflow-hidden rounded-2xl border border-line bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailer.key}`}
              title={trailer.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-line p-6 text-center text-muted">
            No trailer released yet.
          </p>
        )}
      </section>

      {cast.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Cast</h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {cast.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/?actors=${c.id}&view=custom&from=1990-01-01&to=2030-12-31&sort=popularity`}
                  title={`All US releases with ${c.name}`}
                  className="flex items-center gap-3 rounded-xl border border-line bg-panel p-2 hover:border-accent"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-line">
                    {c.profile_path && (
                      <Image
                        src={posterUrl(c.profile_path, "w342")!}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="truncate text-xs text-muted">{c.character}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Reviews{" "}
          {movie.reviews.total_results > 0 && (
            <span className="text-base font-normal text-muted">({movie.reviews.total_results})</span>
          )}
        </h2>
        <ReviewList reviews={movie.reviews.results} />
      </section>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
