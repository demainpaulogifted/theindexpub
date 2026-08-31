import { notFound } from "next/navigation"
import Link from "next/link"

import SiteChrome from "../../../components/SiteChrome"
import ViewTracker from "../../../components/ViewTracker"
import AdBanner from "../../../components/AdBanner"

import {
  getSiteSettings,
  getCategories,
  getPages,
  getSocialLinks,
} from "../../../lib/site"

import {
  getArticleBySlug,
  getPublishedArticles,
} from "../../../lib/articles"

import { getActiveAds } from "../../../lib/ads"

export const revalidate = 60

export async function generateMetadata({ params }) {
  const article = await getArticleBySlug(params.slug)

  if (!article) {
    return {
      title: "Article not found | THE INDEX",
    }
  }

  return {
    title: article.meta_title || article.title,
    description:
      article.meta_description ||
      article.excerpt ||
      "Read this article on THE INDEX.",
    alternates: {
      canonical: `/article/${article.slug}`,
    },
    openGraph: {
      title: article.meta_title || article.title,
      description:
        article.meta_description ||
        article.excerpt ||
        "",
      images: article.featured_image
        ? [article.featured_image]
        : [],
    },
  }
}

function getRecommendedArticles(currentArticle, allArticles) {
  const currentCategories = new Set()

  if (currentArticle.categories) {
    if (Array.isArray(currentArticle.categories)) {
      currentArticle.categories.forEach((category) => {
        if (category?.id) {
          currentCategories.add(category.id)
        }
      })
    } else if (currentArticle.categories.id) {
      currentCategories.add(currentArticle.categories.id)
    }
  }

  return allArticles
    .filter((article) => article.id !== currentArticle.id)
    .map((article) => {
      let score = 0
      const articleCategories = []

      if (Array.isArray(article.categories)) {
        articleCategories.push(...article.categories)
      } else if (article.categories) {
        articleCategories.push(article.categories)
      }

      for (const category of articleCategories) {
        if (category?.id && currentCategories.has(category.id)) {
          score += 10
        }
      }

      return {
        article,
        score,
      }
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }
      return (
        new Date(b.article.published_at || 0) -
        new Date(a.article.published_at || 0)
      )
    })
    .slice(0, 6)
    .map((item) => item.article)
}

export default async function ArticlePage({ params }) {
  const [
    article,
    settings,
    categories,
    pages,
    socialLinks,
    allArticles,
  ] = await Promise.all([
    getArticleBySlug(params.slug),
    getSiteSettings(),
    getCategories(),
    getPages(),
    getSocialLinks(),
    getPublishedArticles(100),
  ])

  if (!article) {
    notFound()
  }

  // Load ads for this article
  const [topAds, bottomAds] = await Promise.all([
    getActiveAds({
      placement: "article_top",
      articleId: article.id,
      limit: 1,
    }),
    getActiveAds({
      placement: "article_bottom",
      articleId: article.id,
      limit: 1,
    }),
  ])

  const recommendedArticles = getRecommendedArticles(
    article,
    allArticles
  )

  return (
    <SiteChrome
      siteName={settings?.site_name || "THE INDEX"}
      description={settings?.description || ""}
      categories={categories}
      pages={pages}
      socialLinks={socialLinks}
    >
      <main className="article-page">
        <div className="container">
          <header className="article-header">
            {article.categories && (
              <div className="article-category">
                {Array.isArray(article.categories)
                  ? article.categories
                      .map((category) => category.name)
                      .join(" • ")
                  : article.categories.name}
              </div>
            )}

            <h1>{article.title}</h1>

            {article.excerpt && (
              <p className="hero-description">{article.excerpt}</p>
            )}

            {article.published_at && (
              <time
                className="article-date"
                dateTime={article.published_at}
              >
                {new Date(article.published_at).toLocaleDateString()}
              </time>
            )}
          </header>

          {article.featured_image && (
            <img
              src={article.featured_image}
              alt={article.title}
              className="article-image"
              style={{
                maxWidth: "900px",
                width: "100%",
                marginBottom: "40px",
              }}
            />
          )}

          {/* TOP OF ARTICLE AD */}
          {topAds.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              {topAds.map((ad) => (
                <AdBanner key={ad.id} ad={ad} />
              ))}
            </div>
          )}

          <article
            className="article-content"
            dangerouslySetInnerHTML={{
              __html: article.content || "",
            }}
          />

          {/* BOTTOM OF ARTICLE AD */}
          {bottomAds.length > 0 && (
            <div style={{ marginTop: "40px" }}>
              {bottomAds.map((ad) => (
                <AdBanner key={ad.id} ad={ad} />
              ))}
            </div>
          )}

          <ViewTracker articleId={article.id} />

          {recommendedArticles.length > 0 && (
            <section
              className="recommended-articles"
              style={{
                marginTop: "60px",
                paddingTop: "40px",
                borderTop: "1px solid #e5e5e5",
              }}
            >
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  marginBottom: "24px",
                }}
              >
                More from THE INDEX
              </h2>

              <p
                className="muted"
                style={{
                  marginBottom: "28px",
                }}
              >
                More stories you may find interesting.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "24px",
                }}
              >
                {recommendedArticles.map((recommended) => (
                  <Link
                    key={recommended.id}
                    href={`/article/${recommended.slug}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <article
                      style={{
                        border: "1px solid #e5e5e5",
                        borderRadius: "16px",
                        overflow: "hidden",
                        height: "100%",
                      }}
                    >
                      {recommended.featured_image && (
                        <img
                          src={recommended.featured_image}
                          alt={recommended.title}
                          style={{
                            width: "100%",
                            aspectRatio: "16 / 9",
                            objectFit: "cover",
                          }}
                        />
                      )}

                      <div style={{ padding: "20px" }}>
                        {recommended.categories && (
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              marginBottom: "8px",
                            }}
                          >
                            {Array.isArray(recommended.categories)
                              ? recommended.categories
                                  .map((category) => category.name)
                                  .join(" • ")
                              : recommended.categories.name}
                          </div>
                        )}

                        <h3
                          style={{
                            fontSize: "19px",
                            lineHeight: 1.3,
                            fontWeight: 700,
                            margin: "0 0 10px",
                          }}
                        >
                          {recommended.title}
                        </h3>

                        {recommended.excerpt && (
                          <p
                            style={{
                              fontSize: "14px",
                              lineHeight: 1.5,
                              margin: 0,
                              opacity: 0.7,
                            }}
                          >
                            {recommended.excerpt}
                          </p>
                        )}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </SiteChrome>
  )
}