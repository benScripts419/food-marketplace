import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  const websiteUrl = "https://akrobite.com/";

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AkroBite",
    alternateName: "AkroBite Food Delivery",
    url: websiteUrl,
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        {/* AkroBite SEO metadata */}
        <title>AkroBite | Food Delivery in Akropong, Ghana</title>

        <meta
          name="description"
          content="Order delicious food from restaurants and food joints in Akropong, Ghana. Discover local meals and enjoy convenient food delivery with AkroBite."
        />

        <meta name="robots" content="index, follow, max-image-preview:large" />

        <meta name="theme-color" content="#E53935" />

        {/* Canonical URL */}
        <link rel="canonical" href={websiteUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AkroBite" />
        <meta
          property="og:title"
          content="AkroBite | Food Delivery in Akropong, Ghana"
        />
        <meta
          property="og:description"
          content="Discover restaurants, explore delicious meals and get food delivered in Akropong with AkroBite."
        />
        <meta property="og:url" content={websiteUrl} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="AkroBite | Food Delivery in Akropong, Ghana"
        />
        <meta
          name="twitter:description"
          content="Order delicious food from restaurants and food joints in Akropong, Ghana."
        />

        {/* Google Site Name Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData),
          }}
        />

        <ScrollViewStyleReset />

        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Safari must not resize text by itself. */
              html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }

              html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                max-width: 100%;
                overflow-x: hidden;
              }

              body {
                background: #ffffff;
                -webkit-tap-highlight-color: transparent;
                overscroll-behavior-y: none;
              }

              html, body, #root { height: 100%; }
              #root { min-height: -webkit-fill-available; }

              @supports (height: 100dvh) {
                html, body, #root { height: 100dvh; }
              }

              input, textarea, select {
                font-size: 16px !important;
              }

              img, video, canvas, svg {
                max-width: 100%;
              }
            `,
          }}
        />
      </head>

      <body>{children}</body>
    </html>
  );
}
