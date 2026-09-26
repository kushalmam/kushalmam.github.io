import path from "path";
import { staticFallback } from "./scripts/staticFallback";

const base =
  process.env.GITHUB_REPOSITORY === "kushalmam/portfolio" ? "/portfolio/" : "/";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

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
