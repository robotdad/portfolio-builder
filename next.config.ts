import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output mode: set NEXT_OUTPUT_MODE=standalone for Azure deployment (~50MB instead of 370MB)
  output: process.env.NEXT_OUTPUT_MODE as NextConfig['output'],
  
  // Exclude user-uploaded files from standalone output file tracing.
  // These are runtime data, not build dependencies.
  outputFileTracingExcludes: {
    '*': ['./public/uploads/**'],
  },
  
  // Image optimization configuration for Azure Blob Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'portfoliodevstore2026.blob.core.windows.net',
        pathname: '/portfolio-images/**',
      },
    ],
  },
  
  // Security headers for all routes
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          {
            // Prevent clickjacking
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // Prevent MIME type sniffing
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Control referrer information
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Restrict browser features
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            // Content Security Policy
            // Note: 'unsafe-inline' needed for Next.js styles, 'unsafe-eval' for dev mode
            // Tighten these for production if possible
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          {
            // Enforce HTTPS (enable when deploying with HTTPS)
            // key: "Strict-Transport-Security",
            // value: "max-age=31536000; includeSubDomains",
            // Commented out for local development
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
      {
        // Specific headers for API routes
        source: "/api/:path*",
        headers: [
          {
            // Prevent caching of API responses with sensitive data
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
