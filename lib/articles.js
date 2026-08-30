import { supabase } from "./supabase";

function normalizePost(post, category = null) {
  return {
    ...post,

    // Keep the names expected by the existing public UI
    content: post.content_html || "",
    meta_title: post.seo_title || null,

    // Existing public UI expects article.categories
    categories: category,
  };
}

async function attachCategories(posts) {
  if (!posts || posts.length === 0) {
    return [];
  }

  const postIds = posts.map((post) => post.id);

  const { data: relations, error: relationError } =
    await supabase
      .from("post_categories")
      .select("post_id, category_id")
      .in("post_id", postIds);

  if (relationError) {
    console.error(
      "Post categories error:",
      relationError
    );

    return posts.map((post) =>
      normalizePost(post)
    );
  }

  const categoryIds = [
    ...new Set(
      (relations || []).map(
        (relation) => relation.category_id
      )
    ),
  ];

  let categories = [];

  if (categoryIds.length > 0) {
    const {
      data,
      error: categoryError,
    } = await supabase
      .from("categories")
      .select("id,name,slug")
      .in("id", categoryIds);

    if (categoryError) {
      console.error(
        "Categories error:",
        categoryError
      );
    } else {
      categories = data || [];
    }
  }

  const categoryMap = Object.fromEntries(
    categories.map((category) => [
      category.id,
      category,
    ])
  );

  const postCategoryMap = {};

  for (const relation of relations || []) {
    postCategoryMap[relation.post_id] =
      categoryMap[relation.category_id] || null;
  }

  return posts.map((post) =>
    normalizePost(
      post,
      postCategoryMap[post.id] || null
    )
  );
}

export async function getPublishedArticles(
  limit = 30
) {
  const { data, error } = await supabase
    .from("posts")
    .select(
      [
        "id",
        "title",
        "slug",
        "excerpt",
        "content_html",
        "featured_image",
        "status",
        "published_at",
        "seo_title",
        "meta_description",
        "canonical_url",
        "no_index",
        "author_id",
        "created_at",
        "updated_at",
      ].join(",")
    )
    .eq("status", "PUBLISHED")
    .eq("no_index", false)
    .order("published_at", {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    console.error(
      "Published articles error:",
      error
    );

    return [];
  }

  return attachCategories(data || []);
}

export async function getArticleBySlug(slug) {
  const { data, error } = await supabase
    .from("posts")
    .select(
      [
        "id",
        "title",
        "slug",
        "excerpt",
        "content_html",
        "featured_image",
        "status",
        "published_at",
        "seo_title",
        "meta_description",
        "canonical_url",
        "no_index",
        "author_id",
        "created_at",
        "updated_at",
      ].join(",")
    )
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .eq("no_index", false)
    .maybeSingle();

  if (error) {
    console.error(
      "Article error:",
      error
    );

    return null;
  }

  if (!data) {
    return null;
  }

  const articles =
    await attachCategories([data]);

  return articles[0] || null;
}

export async function getArticlesByCategory(
  slug,
  limit = 30
) {
  // First find the category.
  const {
    data: category,
    error: categoryError,
  } =
    await supabase
      .from("categories")
      .select("id,name,slug")
      .eq("slug", slug)
      .maybeSingle();

  if (categoryError) {
    console.error(
      "Category error:",
      categoryError
    );

    return [];
  }

  if (!category) {
    return [];
  }

  // Find posts belonging to that category.
  const {
    data: relations,
    error: relationError,
  } = await supabase
    .from("post_categories")
    .select("post_id")
    .eq("category_id", category.id);

  if (relationError) {
    console.error(
      "Category relations error:",
      relationError
    );

    return [];
  }

  const postIds = (relations || []).map(
    (relation) => relation.post_id
  );

  if (postIds.length === 0) {
    return [];
  }

  const {
    data: posts,
    error: postsError,
  } = await supabase
    .from("posts")
    .select(
      [
        "id",
        "title",
        "slug",
        "excerpt",
        "content_html",
        "featured_image",
        "status",
        "published_at",
        "seo_title",
        "meta_description",
        "canonical_url",
        "no_index",
        "author_id",
        "created_at",
        "updated_at",
      ].join(",")
    )
    .in("id", postIds)
    .eq("status", "PUBLISHED")
    .eq("no_index", false)
    .order("published_at", {
      ascending: false,
    })
    .limit(limit);

  if (postsError) {
    console.error(
      "Category articles error:",
      postsError
    );

    return [];
  }

  return attachCategories(posts || []);
    }
