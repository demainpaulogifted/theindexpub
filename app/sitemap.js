import { supabase } from "../lib/supabase";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://theindex.name.ng";

export default async function sitemap() {
  const now = new Date();

  // Published articles (posts table)
  const { data: articles, error: articlesError } = await supabase
    .from("posts")
    .select("slug, published_at, updated_at")
    .eq("status", "PUBLISHED")
    .eq("no_index", false);

  if (articlesError) {
    console.error("Sitemap articles error:", articlesError);
  }

  // Categories
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("slug");

  if (categoriesError) {
    console.error("Sitemap categories error:", categoriesError);
  }

  // Published pages
  const { data: pages, error: pagesError } = await supabase
    .from("pages")
    .select("slug")
    .eq("published", true);

  if (pagesError) {
    console.error("Sitemap pages error:", pagesError);
  }

  const urls = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  // Articles
  for (const article of articles || []) {
    if (!article.slug) continue;

    urls.push({
      url: `\( {SITE_URL}/article/ \){article.slug}`,
      lastModified: article.updated_at || article.published_at
        ? new Date(article.updated_at || article.published_at)
        : now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  // Categories
  for (const category of categories || []) {
    if (!category.slug) continue;

    urls.push({
      url: `\( {SITE_URL}/category/ \){category.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  // Pages
  for (const page of pages || []) {
    if (!page.slug) continue;

    urls.push({
      url: `\( {SITE_URL}/page/ \){page.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return urls;
}