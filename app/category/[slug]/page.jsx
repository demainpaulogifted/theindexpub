import { notFound } from "next/navigation";
import Link from "next/link";
import SiteChrome from "../../../components/SiteChrome";
import {
  getSiteSettings,
  getCategories,
  getPages,
  getSocialLinks
} from "../../../lib/site";
import { getArticlesByCategory } from "../../../lib/articles";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const articles = await getArticlesByCategory(params.slug, 1);
  const category = articles[0]?.categories;

  if (!category) {
    return {
      title: "Category | THE INDEX"
    };
  }

  return {
    title: `${category.name} | THE INDEX`,
    description: `Latest ${category.name} articles on THE INDEX.`,
    alternates: {
      canonical: `/category/${category.slug}`
    }
  };
}

export default async function CategoryPage({ params }) {
  const [
    settings,
    categories,
    pages,
    socialLinks,
    articles
  ] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getPages(),
    getSocialLinks(),
    getArticlesByCategory(params.slug)
  ]);

  const category = articles[0]?.categories;

  if (!category) {
    notFound();
  }

  return (
    <SiteChrome
      siteName={settings.site_name}
      description={settings.description}
      categories={categories}
      pages={pages}
      socialLinks={socialLinks}
    >
      <main className="articles-section">
        <div className="container">
          <p className="hero-label">Category</p>

          <h1 className="section-heading">
            {category.name}
          </h1>

          {articles.length === 0 ? (
            <p style={{ color: "#666" }}>
              No published articles in this category yet.
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

                  <div className="article-category">
                    {category.name}
                  </div>

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
      </main>
    </SiteChrome>
  );
                  }
