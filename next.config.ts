import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/explore", destination: "/around", permanent: true },
      { source: "/:locale/explore", destination: "/:locale/around", permanent: true },
    ];
  },
  transpilePackages: ["maplibre-gl", "react-map-gl", "@mintplex-labs/piper-tts-web", "onnxruntime-web"],
  turbopack: {
    resolveAlias: {
      fs: { browser: "./src/lib/speech/node-stub.ts" },
      path: { browser: "./src/lib/speech/node-stub.ts" },
    },
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
