import { withSentryConfig } from '@sentry/nextjs';
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'nextjs.org',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'dhbi87dthvst2.cloudfront.net',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'cdn.discordapp.com',
            },
            {
                protocol: 'https',
                hostname: 'resumeforgeai.in',
            },
        ],
    },
    experimental: {
        serverComponentsExternalPackages: ["@sparticuz/chromium", "@napi-rs/canvas"],
    },
    transpilePackages: ['react-pdf', 'pdfjs-dist', 'react-markdown', 'remark-gfm'],
    async headers() {
        return [
            {
                // CORS headers for all API routes — refined per-origin in middleware
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,PATCH,OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
                ],
            },
        ];
    },
    async rewrites() {
        // When deployed on Vercel with all subdomains pointing to this project,
        // the middleware handles host-based routing. These rewrites act as a
        // fallback for local development where you might proxy subdomains.
        return [
            // app.resumeforgeai.in → pass through (middleware handles auth)
            {
                source: '/:path*',
                has: [{ type: 'host', value: 'app.resumeforgeai.in' }],
                destination: '/:path*',
            },
            // admin.resumeforgeai.in → /admin/:path*
            {
                source: '/:path*',
                has: [{ type: 'host', value: 'admin.resumeforgeai.in' }],
                destination: '/admin/:path*',
            },
            // api.resumeforgeai.in → /api/:path*
            {
                source: '/:path*',
                has: [{ type: 'host', value: 'api.resumeforgeai.in' }],
                destination: '/api/:path*',
            },
        ];
    },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "growxlabs",

  project: "resumeforgeai-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

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
