import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Enforce HTTPS for browsers that have seen the site once
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Basic clickjacking protection
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Limit referrer data on outbound requests
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Conservative Content Security Policy; adjust if you add new hosts
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self';",
              // Allow app + third-party auth/CAPTCHA scripts over HTTPS
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https: blob:;",
              // Allow embedded iframes such as Clerk CAPTCHA challenges
              "frame-src 'self' https:;",
              "worker-src 'self' blob: https://clerk.quantumsuites-ai.com https://*.clerk.accounts.dev;",
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' data: https:;",
              "font-src 'self' data: https:;",
              "connect-src 'self' https:;",
              "frame-ancestors 'none';",
            ].join(" "),
          },
          // Lock down powerful APIs (expand as needed)
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "quantum-suites-ai.vercel.app",
          },
        ],
        destination: "https://www.quantumsuites-ai.com/:path*",
        permanent: true,
      },
    ];
  },
};

const sentryWebpackPluginOptions = {
  silent: true,
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "quantum-suites-ai",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
