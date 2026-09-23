import { searchPeople } from "@/lib/tmdb";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return Response.json([]);
  try {
    const people = await searchPeople(q);
    return Response.json(
      people.map(({ id, name, profile_path }) => ({ id, name, profile_path })),
    );
  } catch {
    return Response.json({ error: "Actor search failed" }, { status: 502 });
  }
}
