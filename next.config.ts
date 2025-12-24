import type { NextConfig } from "next";

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
};

export default nextConfig;
