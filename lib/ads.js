import { supabase } from "./supabase"

/**
 * Fetch active ads for a specific placement.
 * Optional filters: articleId, categoryId
 */
export async function getActiveAds({
  placement = "between_articles",
  articleId = null,
  categoryId = null,
  limit = 3,
} = {}) {
  const now = new Date().toISOString()

  let query = supabase
    .from("ads")
    .select(
      "id, name, title, description, image_url, target_url, alt_text, placement, article_id, category_id, countries, devices, start_at, end_at, active, views, clicks"
    )
    .eq("active", true)
    .eq("placement", placement)
    .order("created_at", { ascending: false })
    .limit(limit)

  // Schedule filter
  // (ads with null start/end are always eligible)
  query = query.or(`start_at.is.null,start_at.lte.${now}`)
  query = query.or(`end_at.is.null,end_at.gte.${now}`)

  const { data, error } = await query

  if (error) {
    console.error("Ads fetch error:", error.message)
    return []
  }

  let ads = data || []

  // Optional article / category targeting
  if (articleId) {
    ads = ads.filter(
      (ad) => !ad.article_id || ad.article_id === articleId
    )
  }

  if (categoryId) {
    ads = ads.filter(
      (ad) => !ad.category_id || ad.category_id === categoryId
    )
  }

  return ads
}

/**
 * Increment view count (fire-and-forget)
 */
export async function trackAdView(adId) {
  if (!adId) return

  try {
    const { data } = await supabase
      .from("ads")
      .select("views")
      .eq("id", adId)
      .single()

    if (data) {
      await supabase
        .from("ads")
        .update({ views: (data.views || 0) + 1 })
        .eq("id", adId)
    }
  } catch (err) {
    console.warn("Ad view tracking failed:", err.message)
  }
}

/**
 * Increment click count
 */
export async function trackAdClick(adId) {
  if (!adId) return

  try {
    const { data } = await supabase
      .from("ads")
      .select("clicks")
      .eq("id", adId)
      .single()

    if (data) {
      await supabase
        .from("ads")
        .update({ clicks: (data.clicks || 0) + 1 })
        .eq("id", adId)
    }
  } catch (err) {
    console.warn("Ad click tracking failed:", err.message)
  }
}