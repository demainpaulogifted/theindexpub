import { notFound } from "next/navigation";
import SiteChrome from "../../../components/SiteChrome";
import {
  getSiteSettings,
  getCategories,
  getPages,
  getSocialLinks
} from "../../../lib/site";
import { supabase } from "../../../lib/supabase";

export const revalidate = 60;

async function getPage(slug) {
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("Page error:", error);
    return null;
  }

  return data;
}

export async function generateMetadata({ params }) {
  const page = await getPage(params.slug);

  if (!page) {
    return {
      title: "Page not found | THE INDEX"
    };
  }

  return {
    title: page.meta_title || `${page.title} | THE INDEX`,
    description:
      page.meta_description ||
      `Read ${page.title} on THE INDEX.`,
    alternates: {
      canonical: `/page/${page.slug}`
    }
  };
}

export default async function CustomPage({ params }) {
  const [page, settings, categories, pages, socialLinks] =
    await Promise.all([
      getPage(params.slug),
      getSiteSettings(),
      getCategories(),
      getPages(),
      getSocialLinks()
    ]);

  if (!page) {
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
            <h1>{page.title}</h1>
          </header>

          <article
            className="article-content"
            dangerouslySetInnerHTML={{
              __html: page.content || ""
            }}
          />
        </div>
      </main>
    </SiteChrome>
  );
    }
