import type { NextConfig } from "next";

const isExport = process.env.NODE_ENV === 'production';

// Only include i18n config when not doing static export
const i18n = !isExport ? {
  defaultLocale: 'en',
  locales: ['en', 'es', 'fr', 'hi', 'zh'],
} : undefined;

const nextConfig: NextConfig = {
  ...(i18n ? { i18n } : {}),
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // Hide Next.js dev indicators/overlay in development
  devIndicators: false,
  // 禁用 Next.js 热重载，由 nodemon 处理重编译
  reactStrictMode: false,
  // Static export configuration
  output: isExport ? 'export' : undefined,
  // Disable i18n for static export
  ...(isExport ? { i18n: undefined } : {}),
  // Disable trailing slash for cleaner URLs
  trailingSlash: false,
  // Base path for deployment
  basePath: process.env.NETLIFY ? undefined : '',
  // Asset prefix for CDN
  assetPrefix: process.env.NETLIFY ? undefined : '',
  // Images configuration for static export
  images: {
    unoptimized: process.env.NODE_ENV === 'production',
  },
  // Output directory for static export
  distDir: process.env.NODE_ENV === 'production' ? 'out' : '.next',
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // 禁用 webpack 的热模块替换
      config.watchOptions = {
        ignored: ['**/*'], // 忽略所有文件变化
      };
    }
    
    // Fix for module loading issues - keep only essential fallbacks
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Handle dynamic imports
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    
    // Fix vendor chunk issues
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
            },
          },
        },
      };
    }
    
    return config;
  },
  eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  // Fix for vendor chunks
  experimental: {
    optimizePackageImports: ['@radix-ui'],
  },
};

export default nextConfig;
