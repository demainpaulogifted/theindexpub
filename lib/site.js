import "./globals.css"

import {
  getSiteSettings,
} from "../lib/site"

import Script from "next/script"

export const revalidate = 60

export async function generateMetadata() {
  const settings = await getSiteSettings()

  const siteName =
    settings?.site_name || "THE INDEX"

  const description =
    settings?.meta_description ||
    settings?.blog_description ||
    settings?.tagline ||
    "Meaningful content, ideas, guides and stories that matter."

  const title =
    settings?.default_seo_title ||
    siteName

  const siteUrl =
    settings?.site_url ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"

  const metadata = {
    title,
    description,
    metadataBase: new URL(siteUrl),

    robots: {
      index: true,
      follow: true,
    },
  }

  const verification = {}

  if (
    settings?.google_search_console_verification
  ) {
    verification.google =
      settings.google_search_console_verification
  }

  if (
    settings?.bing_webmaster_verification
  ) {
    verification.bing =
      settings.bing_webmaster_verification
  }

  if (
    settings?.facebook_domain_verification
  ) {
    verification.other = {
      "facebook-domain-verification":
        settings.facebook_domain_verification,
    }
  }

  if (
    settings?.pinterest_verification
  ) {
    verification.other = {
      ...(verification.other || {}),
      "p:pinterest":
        settings.pinterest_verification,
    }
  }

  if (Object.keys(verification).length > 0) {
    metadata.verification =
      verification
  }

  if (settings?.favicon_url) {
    metadata.icons = {
      icon: settings.favicon_url,
    }
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
    }

    metadata.twitter = {
      card: "summary_large_image",
      title,
      description,
      images: [
        settings.social_image_url,
      ],
    }
  }

  return metadata
}

export default async function RootLayout({
  children,
}) {
  const settings = await getSiteSettings()

  const analyticsId =
    settings?.google_analytics_id?.trim()

  const tagManagerId =
    settings?.google_tag_manager_id?.trim()

  const adsensePublisherId =
    settings?.google_adsense_publisher_id?.trim()

  return (
    <html lang="en">
      <body>
        {children}

        {analyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
              strategy="afterInteractive"
            />

            <Script
              id="google-analytics"
              strategy="afterInteractive"
            >
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${analyticsId}');
              `}
            </Script>
          </>
        )}

        {tagManagerId && (
          <Script
            id="google-tag-manager"
            strategy="afterInteractive"
          >
            {`
              (function(w,d,s,l,i){
                w[l]=w[l]||[];
                w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),
                dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;
                j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${tagManagerId}');
            `}
          </Script>
        )}

        {adsensePublisherId && (
          <Script
            id="google-adsense"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsensePublisherId}`}
            crossOrigin="anonymous"
          />
        )}
      </body>
    </html>
  )
}