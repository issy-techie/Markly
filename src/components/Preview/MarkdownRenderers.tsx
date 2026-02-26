import { convertFileSrc } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import plantumlEncoder from "plantuml-encoder";
import type { Components } from "react-markdown";

interface RendererOptions {
  activeFilePath: string | null | undefined;
  isDark: boolean;
}

/** Allowed URL schemes for external link opening */
const ALLOWED_SCHEMES = ['http:', 'https:', 'mailto:'];

/** Validate that a URL uses a safe scheme before opening it externally */
const isSafeUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ALLOWED_SCHEMES.includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Create custom renderers for ReactMarkdown.
 * - a: Open links in the external browser via Tauri's openUrl
 * - img: Convert relative paths to Tauri asset URLs
 * - video: Convert relative paths to Tauri asset URLs for video playback
 * - code: Render mermaid / PlantUML diagrams
 */
export const createMarkdownComponents = ({
  activeFilePath,
  isDark,
}: RendererOptions): Components => ({
  a({ href, children, ...props }: any) {
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          if (href && isSafeUrl(href)) openUrl(href);
        }}
        className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer"
        {...props}
      >
        {children}
      </a>
    );
  },

  img({ src, alt, ...props }) {
    if (!src || !activeFilePath) return null;
    const decodedSrc = decodeURIComponent(src);
    const baseDir = activeFilePath.replace(/\\/g, "/").replace(/\/[^/]+$/, "");

    const relativePath = decodedSrc.startsWith("./") ? decodedSrc.substring(2) : decodedSrc;
    const resolvedPath = `${baseDir}/${relativePath}`;
    const assetUrl = convertFileSrc(resolvedPath);
    return <img src={assetUrl} alt={alt} {...props} className="max-w-full rounded shadow-md my-4 h-auto" />;
  },

  video({ src, ...props }: any) {
    if (!src || !activeFilePath) return null;
    const decodedSrc = decodeURIComponent(src);

    // Pass through remote URLs directly
    if (decodedSrc.startsWith("http://") || decodedSrc.startsWith("https://")) {
      return <video src={decodedSrc} {...props} controls className="max-w-full rounded shadow-md my-4" />;
    }

    const baseDir = activeFilePath.replace(/\\/g, "/").replace(/\/[^/]+$/, "");
    const relativePath = decodedSrc.startsWith("./") ? decodedSrc.substring(2) : decodedSrc;
    const resolvedPath = `${baseDir}/${relativePath}`;
    const assetUrl = convertFileSrc(resolvedPath);
    return <video src={assetUrl} {...props} controls className="max-w-full rounded shadow-md my-4" />;
  },

  code({ inline, className, children }: any) {
    const match = /language-(\w+)/.exec(className || "");
    const codeContent = String(children).replace(/\n$/, "");
    if (!inline && match && match[1] === "mermaid") {
      return <div className="mermaid">{codeContent}</div>;
    }
    if (!inline && match && (match[1] === "plantuml" || match[1] === "puml")) {
      return (
        <div className="my-4 text-center">
          <img
            src={`https://www.plantuml.com/plantuml/svg/${plantumlEncoder.encode(codeContent)}`}
            className={isDark ? "invert opacity-80" : "shadow-md mx-auto"}
          />
        </div>
      );
    }
    return <code className={className}>{children}</code>;
  },
});
