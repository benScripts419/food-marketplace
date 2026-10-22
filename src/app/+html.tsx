import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

// Web only. Wraps every page with the right mobile viewport settings.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Fit the phone's width and let content reach the notch and home bar. */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#ffffff" />

        {/* Makes the page fill the screen and scroll inside the app. */}
        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: responsiveCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveCss = `
html, body {
  height: 100%;
  margin: 0;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior: none;
}

/* Phone browsers resize 100% height when the address bar hides.
   dvh follows the visible screen, so bottom bars stay in place. */
@supports (height: 100dvh) {
  html, body, #root {
    height: 100dvh;
  }
}

/* iOS Safari zooms the whole page when a field's text is under 16px. */
input, textarea, select {
  font-size: 16px !important;
}
`;
