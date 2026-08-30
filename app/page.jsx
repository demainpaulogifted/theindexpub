import Link from "next/link";
import SiteChrome from "../components/SiteChrome";

import {
  getSiteSettings,
  getCategories,
  getPages,
  getSocialLinks,
} from "../lib/site";

import { getPublishedArticles } from "../lib/articles";

export const revalidate = 60;

export default async function HomePage() {
  const [
    settings,
    categories,
    pages,
    socialLinks,
    articles,
  ] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getPages(),
    getSocialLinks(),
    getPublishedArticles(30),
  ]);

  const siteName =
    settings?.site_name || "THE INDEX";

  const description =
    settings?.tagline ||
    settings?.blog_description ||
    settings?.meta_description ||
    "";

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
            <p className="hero-label">
              Independent ideas &amp; stories
            </p>

            <h1>{siteName}</h1>

            <p className="hero-description">
              {description}
            </p>
          </div>
        </section>

        <section className="articles-section">
          <div className="container">
            <h2 className="section-heading">
              Latest articles
            </h2>

            {articles.length === 0 ? (
              <p style={{ color: "#666" }}>
                No articles have been published yet.
              </p>
            ) : (
              <div className="article-grid">
                {articles.map((article) => (
                  <article
                    className="article-card"
                    key={article.id}
                  >
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
                        {article.categories.map(
                          (category) => (
                            <Link
                              key={category.id}
                              href={`/category/${category.slug}`}
                              className="article-category"
                            >
                              {category.name}
                            </Link>
                          )
                        )}
                      </div>
                    )}

                    <h2>
                      <Link
                        href={`/article/${article.slug}`}
                      >
                        {article.title}
                      </Link>
                    </h2>

                    {article.excerpt && (
                      <p className="article-excerpt">
                        {article.excerpt}
                      </p>
                    )}

                    {article.published_at && (
                      <time
                        className="article-date"
                        dateTime={
                          article.published_at
                        }
                      >
                        {new Date(
                          article.published_at
                        ).toLocaleDateString()}
                      </time>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
