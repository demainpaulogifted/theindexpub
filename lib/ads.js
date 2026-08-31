import { supabase } from "./supabase"

export async function getActiveAds({
  placement = "between_articles",
  articleId = null,
  categoryId = null,
  limit = 5,
} = {}) {
  const { data, error } = await supabase
    .from("ads")
    .select(
      "id, name, title, description, image_url, target_url, alt_text, placement, article_id, category_id, countries, devices, start_at, end_at, active, views, clicks"
    )
    .eq("active", true)
    .eq("placement", placement)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Ads fetch error:", error.message)
    return []
  }

  let ads = data || []

  // Optional targeting
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