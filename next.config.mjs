// import { withSentryConfig } from '@sentry/nextjs';
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    swcMinify: true,
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
    typescript: { 
        ignoreBuildErrors: false 
    },
    eslint: { 
        ignoreDuringBuilds: true 
    },
    experimental: {
        serverComponentsExternalPackages: ["@sparticuz/chromium", "@napi-rs/canvas", "pdf-parse", "googlethis", "mammoth"],
        optimizePackageImports: ['lucide-react']
    },
    transpilePackages: ['react-pdf', 'pdfjs-dist', 'react-markdown', 'remark-gfm'],
    async headers() {
        return [
            {
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
        return [
            {
                source: '/:path*',
                has: [{ type: 'host', value: 'app.resumeforgeai.in' }],
                destination: '/:path*',
            },
            {
                source: '/:path*',
                has: [{ type: 'host', value: 'admin.resumeforgeai.in' }],
                destination: '/admin/:path*',
            },
            {
                source: '/:path*',
                has: [{ type: 'host', value: 'api.resumeforgeai.in' }],
                destination: '/api/:path*',
            },
        ];
    },
};

export default nextConfig;

/*
export default withSentryConfig(nextConfig, {
  org: "growxlabs",
  project: "resumeforgeai-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
*/
