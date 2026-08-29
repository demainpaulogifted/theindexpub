import { supabase } from "../lib/supabase";

export default async function sitemap() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const { data: articles } = await supabase
    .from("articles")
    .select("slug,published_at")
    .eq("published", true);

  const { data: categories } = await supabase
    .from("categories")
    .select("slug");

  const { data: pages } = await supabase
    .from("pages")
    .select("slug")
    .eq("published", true);

  const urls = [
    {
      url: siteUrl,
      lastModified: new Date()
    }
  ];

  for (const article of articles || []) {
    urls.push({
      url: `${siteUrl}/article/${article.slug}`,
      lastModified: article.published_at
        ? new Date(article.published_at)
        : new Date()
    });
  }

  for (const category of categories || []) {
    urls.push({
      url: `${siteUrl}/category/${category.slug}`,
      lastModified: new Date()
    });
  }

  for (const page of pages || []) {
    urls.push({
      url: `${siteUrl}/page/${page.slug}`,
      lastModified: new Date()
    });
  }

  return urls;
}
