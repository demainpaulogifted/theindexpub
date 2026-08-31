import { getSiteSettings } from "../../lib/site"

export const revalidate = 300

export async function GET() {
  const settings = await getSiteSettings()

  const siteUrl =
    settings?.site_url ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"

  const customRobots =
    settings?.robots_txt?.trim()

  const content =
    customRobots ||
    `User-agent: *
Allow: /

Sitemap: ${siteUrl.replace(/\/+$/, "")}/sitemap.xml`

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control":
        "public, s-maxage=300, stale-while-revalidate=600",
    },
  })
}