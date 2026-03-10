/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'nextjs.org',
            },
        ],
    },
    experimental: {
        serverComponentsExternalPackages: ["@sparticuz/chromium"],
    },
    transpilePackages: ['react-pdf', 'pdfjs-dist'],
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

export default nextConfig;
