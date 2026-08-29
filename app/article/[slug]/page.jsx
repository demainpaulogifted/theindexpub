import { notFound } from "next/navigation";
import SiteChrome from "../../../components/SiteChrome";
import ViewTracker from "../../../components/ViewTracker";
import {
  getSiteSettings,
  getCategories,
  getPages,
  getSocialLinks
} from "../../../lib/site";
import { getArticleBySlug } from "../../../lib/articles";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: "Article not found | THE INDEX"
    };
  }

  return {
    title: article.meta_title || article.title,
    description:
      article.meta_description ||
      article.excerpt ||
      "Read this article on THE INDEX.",
    alternates: {
      canonical: `/article/${article.slug}`
    },
    openGraph: {
      title: article.meta_title || article.title,
      description:
        article.meta_description ||
        article.excerpt ||
        "",
      images: article.featured_image
        ? [article.featured_image]
        : []
    }
  };
}

export default async function ArticlePage({ params }) {
  const [article, settings, categories, pages, socialLinks] =
    await Promise.all([
      getArticleBySlug(params.slug),
      getSiteSettings(),
      getCategories(),
      getPages(),
      getSocialLinks()
    ]);

  if (!article) {
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
      <main className="article-page">
        <div className="container">
          <header className="article-header">
            {article.categories && (
              <div className="article-category">
                {article.categories.name}
              </div>
            )}

            <h1>{article.title}</h1>

            {article.excerpt && (
              <p className="hero-description">
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
          </header>

          {article.featured_image && (
            <img
              src={article.featured_image}
              alt={article.title}
              className="article-image"
              style={{
                maxWidth: "900px",
                marginBottom: "40px"
              }}
            />
          )}

          <div className="ad-slot">
            Advertisement
          </div>

          <article
            className="article-content"
            dangerouslySetInnerHTML={{
              __html: article.content || ""
            }}
          />

          <ViewTracker articleId={article.id} />
        </div>
      </main>
    </SiteChrome>
  );
      }
