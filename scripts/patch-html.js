// Run after `expo export --platform web`.
// Expo's single-page export ignores src/app/+html.tsx, so this edits the
// built dist/index.html directly: mobile viewport + responsive fixes.

const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "dist", "index.html");

if (!fs.existsSync(file)) {
  console.error("patch-html: dist/index.html not found. Run the export first.");
  process.exit(1);
}

let html = fs.readFileSync(file, "utf8");

const viewportTag = /<meta\s+name="viewport"[^>]*>/i;

if (!viewportTag.test(html)) {
  console.error("patch-html: viewport tag not found, nothing patched.");
  process.exit(1);
}

// 1. Fit the phone's width and let content reach the notch and home bar.
html = html.replace(
  viewportTag,
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />' +
    '<meta name="theme-color" content="#ffffff" />',
);

// 2. Responsive fixes, added last so they override Expo's reset.
const css = `
html, body {
  height: 100%;
  margin: 0;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior: none;
}
/* dvh follows the visible screen when the phone's address bar hides. */
@supports (height: 100dvh) {
  html, body, #root { height: 100dvh; }
}
/* iOS Safari zooms the page when a field's text is under 16px. */
input, textarea, select { font-size: 16px !important; }
`;

if (!html.includes('id="mobile-fixes"')) {
  html = html.replace(
    "</head>",
    `<style id="mobile-fixes">${css}</style></head>`,
  );
}

fs.writeFileSync(file, html);
console.log("patch-html: dist/index.html patched.");