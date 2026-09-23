export default function SetupNotice() {
  return (
    <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-line bg-panel p-8">
      <h2 className="text-xl font-semibold">Connect to TMDB</h2>
      <p className="text-muted">This app gets its movie data from The Movie Database. It needs a free API token to run.</p>
      <ol className="list-decimal space-y-2 pl-5 text-sm">
        <li>
          Create a free account at{" "}
          <a className="text-accent underline" href="https://www.themoviedb.org/signup" target="_blank" rel="noopener noreferrer">
            themoviedb.org
          </a>
          .
        </li>
        <li>
          Go to{" "}
          <a className="text-accent underline" href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer">
            Settings → API
          </a>{" "}
          and copy the <strong>API Read Access Token</strong>.
        </li>
        <li>
          Create <code className="rounded bg-line px-1">.env.local</code> in the project folder containing{" "}
          <code className="rounded bg-line px-1">TMDB_TOKEN=your_token</code>.
        </li>
        <li>Restart the dev server.</li>
      </ol>
    </div>
  );
}
