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
};

export default nextConfig;
