import { supabase } from "./supabase";

export async function getSiteSettings() {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("created_at", {
      ascending: true,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Site settings error:", error);
    return null;
  }

  return data;
}

export async function getSocialLinks() {
  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .eq("active", true)
    .order("sort_order", {
      ascending: true,
    });

  if (error) {
    console.error("Social links error:", error);
    return [];
  }

  return data || [];
}

export async function getPages() {
  const { data, error } = await supabase
    .from("pages")
    .select(
      "id,title,slug,content_html,meta_description,published,no_index,sort_order,created_at,updated_at"
    )
    .eq("published", true)
    .eq("no_index", false)
    .order("sort_order", {
      ascending: true,
    });

  if (error) {
    console.error("Pages error:", error);
    return [];
  }

  return data || [];
}

/*
  Public categories are intentionally NOT all categories.

  A category becomes publicly visible only when it has
  at least one published, indexable post.
*/
export async function getCategories() {
  const {
    data: relations,
    error: relationError,
  } = await supabase
    .from("post_categories")
    .select("category_id");

  if (relationError) {
    console.error(
      "Public category relations error:",
      relationError
    );

    return [];
  }

  const categoryIds = [
    ...new Set(
      (relations || []).map(
        (relation) => relation.category_id
      )
    ),
  ];

  if (categoryIds.length === 0) {
    return [];
  }

  const {
    data: categories,
    error: categoryError,
  } = await supabase
    .from("categories")
    .select(
      "id,name,slug,parent_id,description"
    )
    .in("id", categoryIds)
    .order("name", {
      ascending: true,
    });

  if (categoryError) {
    console.error(
      "Public categories error:",
      categoryError
    );

    return [];
  }

  const {
    data: publishedRelations,
    error: publishedError,
  } = await supabase
    .from("post_categories")
    .select(
      "category_id, posts!inner(id,status,no_index)"
    )
    .eq("posts.status", "PUBLISHED")
    .eq("posts.no_index", false);

  if (publishedError) {
    console.error(
      "Published category relations error:",
      publishedError
    );

    return [];
  }

  const activeCategoryIds = new Set(
    (publishedRelations || []).map(
      (relation) => relation.category_id
    )
  );

  return (categories || []).filter(
    (category) =>
      activeCategoryIds.has(category.id)
  );
}