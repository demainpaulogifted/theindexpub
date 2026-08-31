import { NextResponse } from "next/server"
import { supabase } from "../../../lib/supabase"

export async function POST(request) {
  try {
    const body = await request.json()
    const articleId = body?.articleId

    if (!articleId) {
      return NextResponse.json(
        { error: "Missing articleId" },
        { status: 400 }
      )
    }

    const userAgent =
      request.headers.get("user-agent") || ""

    const visitorId =
      request.headers.get("x-visitor-id") ||
      "anonymous"

    const referrer =
      request.headers.get("referer") ||
      null

    const country =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("x-nf-country") ||
      "Unknown"

    const city =
      request.headers.get("x-vercel-ip-city") ||
      "Unknown"

    let deviceType = "desktop"

    if (/ipad|tablet/i.test(userAgent)) {
      deviceType = "tablet"
    } else if (/mobile|android|iphone|ipod/i.test(userAgent)) {
      deviceType = "mobile"
    }

    let browser = "Unknown"

    if (/edg/i.test(userAgent)) {
      browser = "Edge"
    } else if (/chrome/i.test(userAgent)) {
      browser = "Chrome"
    } else if (/firefox/i.test(userAgent)) {
      browser = "Firefox"
    } else if (/safari/i.test(userAgent)) {
      browser = "Safari"
    } else if (/opera|opr/i.test(userAgent)) {
      browser = "Opera"
    }

    let operatingSystem = "Unknown"

    if (/windows/i.test(userAgent)) {
      operatingSystem = "Windows"
    } else if (/android/i.test(userAgent)) {
      operatingSystem = "Android"
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
      operatingSystem = "iOS"
    } else if (/mac os/i.test(userAgent)) {
      operatingSystem = "macOS"
    } else if (/linux/i.test(userAgent)) {
      operatingSystem = "Linux"
    }

    const { error } = await supabase
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

    if (error) {
      console.error(
        "Article view insert error:",
        error
      )

      return NextResponse.json(
        { error: "Unable to record article view" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error(
      "Article view API error:",
      error
    )

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    )
  }
}