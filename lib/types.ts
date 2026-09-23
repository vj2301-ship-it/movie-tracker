export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  popularity: number;
  vote_average: number;
  vote_count: number;
}

export interface DiscoverResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
}

export interface Video {
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
}

export interface Review {
  id: string;
  author: string;
  author_details: { rating: number | null; username: string };
  content: string;
  created_at: string;
  url: string;
}

export interface ReleaseDateEntry {
  certification: string;
  release_date: string;
  type: number;
  note: string;
}

export interface MovieDetails extends Omit<Movie, "genre_ids"> {
  genres: Genre[];
  runtime: number | null;
  tagline: string;
  imdb_id: string | null;
  homepage: string | null;
  status: string;
  videos: { results: Video[] };
  credits: { cast: CastMember[]; crew: CrewMember[] };
  reviews: { results: Review[]; total_results: number };
  release_dates: {
    results: { iso_3166_1: string; release_dates: ReleaseDateEntry[] }[];
  };
}
