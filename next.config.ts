import type { NextConfig } from "next";
import { RemovePolyfillPlugin } from "./lib/RemovePolyfillPlugin";

const nextConfig: NextConfig = {
  experimental: {
    inlineCss: true,
  },
  // Webpack configuration (for --webpack flag)
  webpack(config, { isServer }) {
    // Find the rule that handles SVG files
    const fileLoaderRule = config.module.rules.find(
      (rule: { test?: { test?: (str: string) => boolean } }) =>
        rule.test?.test?.(".svg")
    );

    if (fileLoaderRule) {
      config.module.rules.push(
        // Reapply the existing rule, but only for svg imports ending in ?url
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: /url/, // *.svg?url
        },
        // Convert all other *.svg imports to React components
        {
          test: /\.svg$/i,
          issuer: fileLoaderRule.issuer,
          resourceQuery: { not: [/url/] }, // exclude if *.svg?url
          use: ["@svgr/webpack"],
        }
      );

      // Modify the file loader rule to ignore *.svg, since we have it handled now.
      fileLoaderRule.exclude = /\.svg$/i;
    }

    // Add polyfill remover plugin (only for client-side builds)
    if (!isServer) {
      config.plugins.push(new RemovePolyfillPlugin());
    }

    return config;
  },
  // Turbopack configuration (default in Next.js 16)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
