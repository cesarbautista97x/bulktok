/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['api.hedra.com'],
    },
    eslint: {
        // Disable ESLint during builds for faster deployment
        ignoreDuringBuilds: true,
    },
}

module.exports = nextConfig
