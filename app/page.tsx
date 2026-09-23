import FilterBar from "@/components/FilterBar";
import MovieCard from "@/components/MovieCard";
import Pagination from "@/components/Pagination";
import SetupNotice from "@/components/SetupNotice";
import { formatDate, parseFilters } from "@/lib/filters";
import {
  discoverMovies,
  getGenres,
  getPerson,
  getUsReleaseDate,
  TmdbConfigError,
} from "@/lib/tmdb";

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const filters = parseFilters(params);

  let data, genres, actors;
  try {
    [data, genres, actors] = await Promise.all([
      discoverMovies(filters),
      getGenres(),
      Promise.all(
        filters.actors.map((id) =>
          getPerson(id).then(
            (p) => ({ id: p.id, name: p.name }),
            () => ({ id, name: `Actor #${id}` }),
          ),
        ),
      ),
    ]);
  } catch (err) {
    if (err instanceof TmdbConfigError) return <SetupNotice />;
    throw err;
  }

  const genreNames = new Map(genres.map((g) => [g.id, g.name]));

  // Discover only returns the worldwide premiere date; look up the US one per card.
  const window = { from: filters.from, to: filters.to };
  const usDates = await Promise.all(data.results.map((m) => getUsReleaseDate(m.id, window)));
  const movies = data.results.map((m, i) => ({ ...m, release_date: usDates[i] ?? m.release_date }));
  if (filters.sort === "date") {
    movies.sort((a, b) => (a.release_date || "9999").localeCompare(b.release_date || "9999"));
  }

  return (
    <div className="space-y-8">
      <FilterBar genres={genres} filters={filters} selectedActors={actors} />

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold">
          {filters.view === "now" ? "In US theaters" : "US releases"}{" "}
          <span className="font-normal text-muted">
            {formatDate(filters.from)} to {formatDate(filters.to)}
          </span>
        </h2>
        <p className="text-sm text-muted">
          {data.total_results.toLocaleString()} {data.total_results === 1 ? "movie" : "movies"}
        </p>
      </div>

      {movies.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-10 text-center text-muted">
          No movies match these filters. Try widening the date range or removing a filter.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} genreNames={genreNames} />
          ))}
        </div>
      )}

      <Pagination page={filters.page} totalPages={data.total_pages} params={params} />
    </div>
  );
}
