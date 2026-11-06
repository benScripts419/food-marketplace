import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

// The page every web screen sits in. Save as src/app/+html.tsx.
// If you already have this file, keep your own tags and copy in the
// viewport line and the <style> rules.

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Without this line, iPhone Safari draws the page about 980 px wide
            and shrinks it, so nothing fits the screen. */}
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
        <link rel="canonical" href="https://akrobite.com/" />

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
        <meta property="og:url" content="https://akrobite.com/" />

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
                /* No bouncing of the whole page, and no pull-to-refresh. */
                overscroll-behavior-y: none;
              }

              /* Page height. Safari's address bar and toolbar change the
                 visible height, so plain 100% (and 100vh) leaves the bottom
                 of the page, and buttons fixed to it, hidden. */
              html, body, #root { height: 100%; }
              #root { min-height: -webkit-fill-available; }
              @supports (height: 100dvh) {
                html, body, #root { height: 100dvh; }
              }

              /* iPhone Safari zooms in on any text box with text smaller than
                 16 px, and the page then stays zoomed. */
              input, textarea, select { font-size: 16px !important; }

              /* Nothing may push the page wider than the screen. */
              img, video, canvas, svg { max-width: 100%; }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
