# US Release Tracker

Hollywood movie releases in US theaters, with trailers, cast, genre/date/actor filters, and early reviews. Data comes from [TMDB](https://www.themoviedb.org/).

## Setup

1. Get a free token: create a TMDB account, then go to **Settings → API** and copy the **API Read Access Token**.
2. Copy `.env.local.example` to `.env.local` and set `TMDB_TOKEN=...`.
3. Run `npm install` and `npm run dev`, then open http://localhost:3000.

## Features

- **Release window:** Upcoming (next 6 months), Now playing (last 30 days), or custom dates
- **Filters:** genres (any of), actors (autocomplete, any of), sort by release date or popularity. Filters are kept in the URL, so views can be shared.
- **Movie page:** US release date and rating, embedded YouTube trailer, cast (click an actor to see their films), and TMDB reviews
- "Hollywood" means English-language films with a US theatrical or limited release.

## Structure

- `lib/tmdb.ts` – server-only TMDB client (the token never reaches the browser)
- `lib/filters.ts` – URL param parsing and date helpers
- `app/page.tsx` – list + filters, `app/movie/[id]/page.tsx` – details, `app/api/people` – actor autocomplete
