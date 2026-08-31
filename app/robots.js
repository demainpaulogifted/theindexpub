export default function robots() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://theindex.name.ng";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"]
    },
    sitemap: `${siteUrl.replace(/\/+$/, "")}/sitemap.xml`
  };
}