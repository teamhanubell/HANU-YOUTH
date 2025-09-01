/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'res.cloudinary.com', 'lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  devIndicators: false,
  // Enable static exports for Netlify
  output: 'standalone',
  // Enable React Strict Mode
  reactStrictMode: true,
  // Enable Webpack 5
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fixes npm packages that depend on `net` module
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
};

module.exports = nextConfig;
