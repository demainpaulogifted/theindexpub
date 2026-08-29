import { supabase } from "./supabase";

export async function getSiteSettings() {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Site settings error:", error);
    return {
      site_name: "THE INDEX",
      description:
        "Meaningful content, ideas, guides and stories that matter.",
      meta_description:
        "THE INDEX — meaningful content, ideas, guides and stories that matter."
    };
  }

  return (
    data || {
      site_name: "THE INDEX",
      description:
        "Meaningful content, ideas, guides and stories that matter.",
      meta_description:
        "THE INDEX — meaningful content, ideas, guides and stories that matter."
    }
  );
}

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug")
    .order("name");

  if (error) {
    console.error("Categories error:", error);
    return [];
  }

  return data || [];
}

export async function getPages() {
  const { data, error } = await supabase
    .from("pages")
    .select("id,title,slug")
    .eq("published", true)
    .order("title");

  if (error) {
    console.error("Pages error:", error);
    return [];
  }

  return data || [];
}

export async function getSocialLinks() {
  const { data, error } = await supabase
    .from("social_links")
    .select("id,platform,label,url,icon")
    .eq("active", true)
    .order("sort_order");

  if (error) {
    console.error("Social links error:", error);
    return [];
  }

  return data || [];
}
