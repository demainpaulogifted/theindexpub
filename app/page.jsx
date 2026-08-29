import Link from "next/link";
import SiteChrome from "../components/SiteChrome";
import {
  getSiteSettings,
  getCategories,
  getPages,
  getSocialLinks
} from "../lib/site";
import { getPublishedArticles } from "../lib/articles";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, categories, pages, socialLinks, articles] =
    await Promise.all([
      getSiteSettings(),
      getCategories(),
      getPages(),
      getSocialLinks(),
      getPublishedArticles(30)
    ]);

  return (
    <SiteChrome
      siteName={settings.site_name}
      description={settings.description}
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

            <h1>{settings.site_name}</h1>

            <p className="hero-description">
              {settings.description}
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

                    {article.categories && (
                      <Link
                        href={`/category/${article.categories.slug}`}
                        className="article-category"
                      >
                        {article.categories.name}
                      </Link>
                    )}

                    <h2>
                      <Link href={`/article/${article.slug}`}>
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
                        dateTime={article.published_at}
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
