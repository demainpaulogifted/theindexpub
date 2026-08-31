import Link from "next/link"
import SiteChrome from "../components/SiteChrome"
import AdBanner from "../components/AdBanner"

import {
  getSiteSettings,
  getCategories,
  getPages,
  getSocialLinks,
} from "../lib/site"

import { getPublishedArticles } from "../lib/articles"
import { getActiveAds } from "../lib/ads"

export const revalidate = 60

export default async function HomePage() {
  const [
    settings,
    categories,
    pages,
    socialLinks,
    articles,
    homepageAds,
  ] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getPages(),
    getSocialLinks(),
    getPublishedArticles(30),
    getActiveAds({ placement: "homepage", limit: 2 }),
  ])

  // Fetch more between-article ads so we have enough
  const betweenAds = await getActiveAds({
    placement: "between_articles",
    limit: 15,
  })

  const siteName = settings?.site_name || "THE INDEX"
  const tagline = settings?.tagline || ""
  const description =
    settings?.blog_description ||
    tagline ||
    settings?.meta_description ||
    ""

  return (
    <SiteChrome
      siteName={siteName}
      description={description}
      categories={categories}
      pages={pages}
      socialLinks={socialLinks}
    >
      <main>
        <section className="hero">
          <div className="container">
            <p className="hero-label">Independent ideas &amp; stories</p>
            <h1>{siteName}</h1>
            {tagline && <p className="hero-description">{tagline}</p>}
          </div>
        </section>

        {/* Homepage placement ads */}
        {homepageAds.length > 0 && (
          <div className="container">
            {homepageAds.map((ad) => (
              <AdBanner key={ad.id} ad={ad} />
            ))}
          </div>
        )}

        <section className="articles-section">
          <div className="container">
            <h2 className="section-heading">Latest articles</h2>

            {articles.length === 0 ? (
              <p style={{ color: "#666" }}>
                No articles have been published yet.
              </p>
            ) : (
              <div className="article-grid">
                {articles.map((article, index) => (
                  <div key={article.id}>
                    <article className="article-card">
                      {article.featured_image ? (
                        <img
                          src={article.featured_image}
                          alt={article.title}
                          className="article-image"
                        />
                      ) : (
                        <div className="article-image" />
                      )}

                      {article.categories?.length > 0 && (
                        <div
                          className="article-categories"
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                            marginBottom: "10px",
                          }}
                        >
                          {article.categories.map((category) => (
                            <Link
                              key={category.id}
                              href={`/category/${category.slug}`}
                              className="article-category"
                            >
                              {category.name}
                            </Link>
                          ))}
                        </div>
                      )}

                      <h2>
                        <Link href={`/article/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h2>

                      {article.excerpt && (
                        <p className="article-excerpt">{article.excerpt}</p>
                      )}

                      {article.published_at && (
                        <time
                          className="article-date"
                          dateTime={article.published_at}
                        >
                          {new Date(article.published_at).toLocaleDateString()}
                        </time>
                      )}
                    </article>

                    {/* Show an ad after every 2 articles */}
                    {(index + 1) % 2 === 0 &&
                      betweenAds[Math.floor(index / 2)] && (
                        <AdBanner
                          ad={betweenAds[Math.floor(index / 2)]}
                        />
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </SiteChrome>
  )
}