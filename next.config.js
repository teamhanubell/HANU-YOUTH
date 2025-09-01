/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Static export configuration
  output: 'export',
  trailingSlash: true,
  
  // Disable server-side features for static export
  experimental: {
    missingSuspenseWithCSRBailout: false,
    // Disable server components for static export
    serverComponentsExternalPackages: [],
  },
  
  // Images configuration for static export
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    domains: [
      'localhost',
      'res.cloudinary.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'hanubell.netlify.app'
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  
  // Webpack configuration for static export
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        dns: false,
        fs: false,
        child_process: false,
      };
    }
    return config;
  },
  
  // Build configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Generate static pages for all routes
  generateBuildId: async () => {
    return 'build'
  },
};

module.exports = nextConfig;
