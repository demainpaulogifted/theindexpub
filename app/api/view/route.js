import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function POST(request) {
  try {
    const body = await request.json();
    const articleId = body?.articleId;

    if (!articleId) {
      return NextResponse.json(
        { error: "Missing articleId" },
        { status: 400 }
      );
    }

    const userAgent =
      request.headers.get("user-agent") || "";

    const device = /mobile|android|iphone|ipad/i.test(
      userAgent
    )
      ? "mobile"
      : /tablet/i.test(userAgent)
      ? "tablet"
      : "desktop";

    const country =
      request.headers.get("x-nf-country") ||
      request.headers.get("x-vercel-ip-country") ||
      "Unknown";

    const { error } = await supabase
      .from("article_views")
      .insert({
        article_id: articleId,
        country,
        device
      });

    if (error) {
      console.error("View insert error:", error);

      return NextResponse.json(
        { error: "Unable to record view" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("View API error:", error);

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
