import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function getDeviceType(userAgent) {
  const ua = userAgent.toLowerCase()

  if (
    /tablet|ipad|playbook|silk/.test(ua) ||
    (/android/.test(ua) && !/mobile/.test(ua))
  ) {
    return "Tablet"
  }

  if (
    /mobile|iphone|ipod|android.*mobile|windows phone/.test(ua)
  ) {
    return "Mobile"
  }

  return "Desktop"
}

function getBrowser(userAgent) {
  const ua = userAgent.toLowerCase()

  if (/edg\//.test(ua)) return "Edge"
  if (/opr\//.test(ua) || /opera/.test(ua)) return "Opera"
  if (/chrome\//.test(ua) && !/edg\//.test(ua)) {
    return "Chrome"
  }
  if (/firefox\//.test(ua)) return "Firefox"
  if (/safari\//.test(ua) && !/chrome\//.test(ua)) {
    return "Safari"
  }

  return "Other"
}

function getOperatingSystem(userAgent) {
  const ua = userAgent.toLowerCase()

  if (/android/.test(ua)) return "Android"
  if (/iphone|ipad|ipod/.test(ua)) return "iOS"
  if (/windows/.test(ua)) return "Windows"
  if (/mac os x|macintosh/.test(ua)) return "macOS"
  if (/linux/.test(ua)) return "Linux"

  return "Other"
}

function isBot(userAgent) {
  return /bot|crawler|spider|crawling|headless|facebookexternalhit|googlebot|bingbot|yandex|baiduspider/i.test(
    userAgent
  )
}

export async function POST(request) {
  try {
    const body = await request.json()
    const articleId = body?.articleId

    if (!articleId) {
      return NextResponse.json(
        {
          error: "articleId is required.",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * Make sure the article actually exists
     * and is published.
     */
    const { data: article, error: articleError } =
      await supabaseAdmin
        .from("posts")
        .select("id,status")
        .eq("id", articleId)
        .maybeSingle()

    if (articleError) {
      console.error(
        "Article lookup failed:",
        articleError
      )

      return NextResponse.json(
        {
          error: "Could not verify article.",
        },
        {
          status: 500,
        }
      )
    }

    if (!article) {
      return NextResponse.json(
        {
          error: "Article not found.",
        },
        {
          status: 404,
        }
      )
    }

    if (article.status !== "PUBLISHED") {
      return NextResponse.json(
        {
          success: false,
          message: "Only published articles are tracked.",
        },
        {
          status: 200,
        }
      )
    }

    const userAgent =
      request.headers.get("user-agent") || "Unknown"

    /*
     * Don't count obvious search-engine crawlers,
     * bots or headless browsers as article views.
     */
    if (isBot(userAgent)) {
      return NextResponse.json({
        success: false,
        message: "Bot traffic ignored.",
      })
    }

    /*
     * Anonymous visitor identifier.
     *
     * We don't store the visitor's name or email.
     * The cookie lets us distinguish returning visitors.
     */
    let visitorId = request.cookies.get(
      "the_index_visitor_id"
    )?.value

    if (!visitorId) {
      visitorId = crypto.randomUUID()
    }

    const deviceType = getDeviceType(userAgent)
    const browser = getBrowser(userAgent)
    const operatingSystem =
      getOperatingSystem(userAgent)

    /*
     * Vercel normally provides these headers when
     * deployed on Vercel.
     *
     * During local development they may be missing.
     */
    const country =
      request.headers.get("x-vercel-ip-country") ||
      "Unknown"

    const city =
      request.headers.get("x-vercel-ip-city") ||
      "Unknown"

    const referrer =
      request.headers.get("referer") ||
      "Direct"

    const { error: insertError } =
      await supabaseAdmin
        .from("article_views")
        .insert({
          article_id: articleId,
          visitor_id: visitorId,
          device_type: deviceType,
          browser,
          operating_system: operatingSystem,
          country,
          city,
          referrer,
          user_agent: userAgent,
        })

    if (insertError) {
      console.error(
        "Article view insert failed:",
        insertError
      )

      return NextResponse.json(
        {
          error: "Could not record article view.",
        },
        {
          status: 500,
        }
      )
    }

    const response = NextResponse.json({
      success: true,
    })

    /*
     * Keep the anonymous visitor ID for one year.
     */
    response.cookies.set(
      "the_index_visitor_id",
      visitorId,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      }
    )

    return response
  } catch (error) {
    console.error(
      "View tracking error:",
      error
    )

    return NextResponse.json(
      {
        error: "View tracking failed.",
      },
      {
        status: 500,
      }
    )
  }
}