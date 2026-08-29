import { supabase } from "./supabase";

export async function getPublishedArticles(limit = 30) {
  const { data, error } = await supabase
    .from("articles")
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image,
      published_at,
      views,
      category_id,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Articles error:", error);
    return [];
  }

  return data || [];
}

export async function getArticleBySlug(slug) {
  const { data, error } = await supabase
    .from("articles")
    .select(`
      id,
      title,
      slug,
      excerpt,
      content,
      featured_image,
      meta_title,
      meta_description,
      published_at,
      views,
      category_id,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("Article error:", error);
    return null;
  }

  return data;
}

export async function getArticlesByCategory(slug, limit = 30) {
  const { data, error } = await supabase
    .from("articles")
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image,
      published_at,
      views,
      categories!inner (
        id,
        name,
        slug
      )
    `)
    .eq("published", true)
    .eq("categories.slug", slug)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Category articles error:", error);
    return [];
  }

  return data || [];
}
