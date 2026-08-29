import Link from "next/link";
import SiteChrome from "../components/SiteChrome";
import {
  getSiteSettings,
  getCategories,
  getPages,
  getSocialLinks
} from "../lib/site";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, categories, pages, socialLinks] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getPages(),
    getSocialLinks()
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
            <p className="hero-label">Independent ideas &amp; stories</p>

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

            <div className="article-grid">
              <article className="article-card">
                <div className="article-image" />

                <div className="article-category">
                  THE INDEX
                </div>

                <h2>Meaningful content starts here</h2>

                <p className="article-excerpt">
                  Articles, ideas, guides and stories will appear here
                  when they are published from the Admin app.
                </p>

                <span className="article-date">
                  Coming soon
                </span>
              </article>
            </div>
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
