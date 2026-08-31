import "./globals.css";
import { SpeedInsights } from '@vercel/speed-insights/next';

import {
  getSiteSettings,
} from "../lib/site";

export const revalidate = 60;

export async function generateMetadata() {
  const settings = await getSiteSettings();

  const siteName =
    settings?.site_name || "THE INDEX";

  const description =
    settings?.meta_description ||
    settings?.blog_description ||
    settings?.tagline ||
    "Meaningful content, ideas, guides and stories that matter.";

  const title =
    settings?.default_seo_title ||
    siteName;

  const siteUrl =
    settings?.site_url ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const metadata = {
    title,
    description,
    metadataBase: new URL(siteUrl),
    robots: {
      index: true,
      follow: true,
    },
  };

  if (settings?.favicon_url) {
    metadata.icons = {
      icon: settings.favicon_url,
    };
  }

  if (settings?.social_image_url) {
    metadata.openGraph = {
      title,
      description,
      url: siteUrl,
      siteName,
      images: [
        {
          url: settings.social_image_url,
        },
      ],
      type: "website",
    };

    metadata.twitter = {
      card: "summary_large_image",
      title,
      description,
      images: [settings.social_image_url],
    };
  }

  return metadata;
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}