import path from "path";
import { staticFallback } from "./scripts/staticFallback";
import { buildFeed } from "./src/feed";

const base =
  process.env.GITHUB_REPOSITORY === "kushalmam/portfolio" ? "/portfolio/" : "/";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, type Plugin } from "vite";

/**
 * Emits feed.xml from the same project data the page renders, and serves it in
 * dev too — otherwise the `<link rel="alternate">` in index.html 404s locally
 * for the entire time you are working on the site.
 */
function portfolioFeed(): Plugin {
  const feed = () => buildFeed({ base, lastBuild: new Date().toUTCString() });
  return {
    name: "portfolio-feed",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url?.split("?")[0] !== `${base}feed.xml`) return next();
        response.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
        response.end(feed());
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "feed.xml", source: feed() });
    },
  };
}

export default defineConfig({
  base,
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    portfolioFeed(),
    {
      name: "portfolio-static-content",
      transformIndexHtml: (html) =>
        html.replace("<!--portfolio-fallback-->", staticFallback(base)),
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },
});
