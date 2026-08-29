import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ articles: [] });
  }

  const { data, error } = await supabase
    .from("articles")
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image,
      published_at,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq("published", true)
    .or(
      `title.ilike.%${query}%,excerpt.ilike.%${query}%`
    )
    .order("published_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("Search error:", error);

    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    articles: data || []
  });
}
