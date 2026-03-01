/**
 * Export utilities for HTML and PDF export.
 *
 * Generates standalone HTML documents from the preview pane content
 * with embedded CSS for offline viewing.
 */

/** Escape HTML special characters */
function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Convert Tauri asset:// or https://asset.localhost/ URLs back to
 * relative file paths so the exported HTML works as a standalone file.
 *
 * The Markdown source uses relative paths like `./file.assets/image.png`.
 * The preview renders these via `convertFileSrc()` which produces
 * `https://asset.localhost/<absolute-path>` URLs.
 *
 * This function reverses the conversion by computing the relative path
 * from the active Markdown file's directory.
 */
export function convertAssetUrlsToRelative(
  html: string,
  activeFilePath: string
): string {
  // Normalize the directory of the active file (forward slashes)
  const activeDir = activeFilePath
    .replace(/\\/g, "/")
    .replace(/\/[^/]+$/, "");

  return html.replace(
    /(?:https:\/\/asset\.localhost|asset:\/\/localhost)\/([^"'>\s]+)/g,
    (_match, encodedPath) => {
      const absPath = decodeURIComponent(encodedPath);
      // Normalize to forward slashes for comparison
      const normalizedAbs = absPath.replace(/\\/g, "/");
      const normalizedDir = activeDir.replace(/\\/g, "/");

      if (normalizedAbs.startsWith(normalizedDir + "/")) {
        // Return as relative path from the markdown file's directory
        return "./" + normalizedAbs.substring(normalizedDir.length + 1);
      }
      // Fallback: return the decoded absolute path
      return absPath;
    }
  );
}

/**
 * Return embedded CSS for standalone HTML export.
 * Provides GitHub-style markdown rendering that works without external dependencies.
 */
function getExportCSS(): string {
  return `
    /* Reset & Base */
    *, *::before, *::after { box-sizing: border-box; }
    html { font-size: 16px; -webkit-text-size-adjust: 100%; }
    body {
      margin: 0 auto;
      max-width: 800px;
      padding: 40px 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #1f2328;
      background: #ffffff;
      word-wrap: break-word;
    }

    /* Headings */
    h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; }
    h1 { font-size: 2em; padding-bottom: 0.3em; border-bottom: 1px solid #d1d9e0; }
    h2 { font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid #d1d9e0; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1em; }
    h5 { font-size: 0.875em; }
    h6 { font-size: 0.85em; color: #636c76; }

    /* Paragraphs & text */
    p { margin-top: 0; margin-bottom: 16px; }
    a { color: #0969da; text-decoration: none; }
    a:hover { text-decoration: underline; }
    strong { font-weight: 600; }

    /* Lists */
    ul, ol { padding-left: 2em; margin-top: 0; margin-bottom: 16px; }
    li { margin-top: 0.25em; }
    li > p { margin-top: 16px; }
    li + li { margin-top: 0.25em; }

    /* Blockquote */
    blockquote {
      margin: 0 0 16px 0;
      padding: 0 1em;
      color: #636c76;
      border-left: 0.25em solid #d1d9e0;
    }

    /* Code */
    code {
      padding: 0.2em 0.4em;
      margin: 0;
      font-size: 85%;
      white-space: break-spaces;
      background-color: #eff1f3;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
    }
    pre {
      padding: 16px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      color: #1f2328;
      background-color: #f6f8fa;
      border-radius: 6px;
      margin-top: 0;
      margin-bottom: 16px;
    }
    pre code {
      padding: 0;
      margin: 0;
      font-size: 100%;
      background-color: transparent;
      border-radius: 0;
      white-space: pre;
    }

    /* Table */
    table {
      border-spacing: 0;
      border-collapse: collapse;
      margin-top: 0;
      margin-bottom: 16px;
      width: max-content;
      max-width: 100%;
      overflow: auto;
      display: block;
    }
    th, td {
      padding: 6px 13px;
      border: 1px solid #d1d9e0;
    }
    th {
      font-weight: 600;
      background-color: #f6f8fa;
    }
    tr:nth-child(2n) {
      background-color: #f6f8fa;
    }

    /* Horizontal rule */
    hr {
      height: 0.25em;
      padding: 0;
      margin: 24px 0;
      background-color: #d1d9e0;
      border: 0;
    }

    /* Images */
    img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
    }

    /* Task lists */
    input[type="checkbox"] { margin-right: 0.5em; }

    /* SVG (Mermaid diagrams) */
    svg { max-width: 100%; height: auto; }

    /* Print-specific */
    @media print {
      body { max-width: none; padding: 0; }
      pre { white-space: pre-wrap; word-wrap: break-word; }
    }
  `;
}

/**
 * Generate a complete standalone HTML document from preview content.
 *
 * @param previewHTML The innerHTML from the .preview-area element
 * @param title      The document title (typically the file name)
 * @param activeFilePath The path of the currently active markdown file
 * @returns A complete HTML document string ready to be saved
 */
export function generateExportHTML(
  previewHTML: string,
  title: string,
  activeFilePath: string
): string {
  // Convert Tauri asset URLs to relative paths
  const processedHTML = convertAssetUrlsToRelative(previewHTML, activeFilePath);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <style>${getExportCSS()}</style>
</head>
<body>
  <article>
${processedHTML}
  </article>
</body>
</html>`;
}
