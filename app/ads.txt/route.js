import { getSiteSettings } from "../../lib/site"

export const revalidate = 300

export async function GET() {
  const settings = await getSiteSettings()

  const content =
    settings?.ads_txt?.trim() || ""

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control":
        "public, s-maxage=300, stale-while-revalidate=600",
    },
  })
}