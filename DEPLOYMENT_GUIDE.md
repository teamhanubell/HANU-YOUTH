# HANU-YOUTH Netlify Deployment Guide

This guide provides step-by-step instructions for deploying the HANU-YOUTH platform on Netlify.

## Project Overview

- **Project Name**: hanu-youth
- **Framework**: Next.js 15 with TypeScript
- **Deployment**: Static export on Netlify
- **URL**: https://hanu-youth.netlify.app

## Prerequisites

1. **Node.js** version 18 or higher
2. **Git** repository with project code
3. **Netlify** account
4. **GitHub** account (for automatic deployments)

## Deployment Options

### Option 1: Automatic Deployment via Git (Recommended)

#### Step 1: Push to GitHub

1. Ensure your project is in a Git repository
2. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Configure for Netlify deployment"
   git push origin main
   ```

#### Step 2: Connect to Netlify

1. Log in to your [Netlify](https://app.netlify.com/) account
2. Click "Add new site" → "Import an existing project"
3. Connect to your GitHub account
4. Select the repository containing your HANU-YOUTH project
5. Configure build settings:
   - **Build command**: `npm run build:netlify`
   - **Publish directory**: `out`
   - **Node version**: 18 or higher

#### Step 3: Set Environment Variables

In your Netlify site settings → Environment variables, add:

```bash
# Database (if using external database)
DATABASE_URL=your_database_url

# Next.js Configuration
NEXT_TELEMETRY_DISABLED=1
NETLIFY=true

# API Keys (if needed)
OPENAI_API_KEY=your_openai_key
FIREBASE_API_KEY=your_firebase_key
```

#### Step 4: Deploy

1. Click "Deploy site"
2. Netlify will automatically build and deploy your site
3. Your site will be available at: `https://hanu-youth.netlify.app`

### Option 2: Manual Deployment via CLI

#### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### Step 2: Login to Netlify

```bash
netlify login
```

#### Step 3: Build the Project

```bash
# Run the deployment script
./deploy-netlify.sh

# Or manually:
npm install
npm run db:generate
npm run build:netlify
```

#### Step 4: Deploy to Netlify

```bash
netlify deploy --prod --dir=out
```

### Option 3: Drag and Drop

1. Build the project locally:
   ```bash
   ./deploy-netlify.sh
   ```

2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag and drop the `out` folder
4. Netlify will deploy your site automatically

## Configuration Files

### netlify.toml

```toml
[build]
  command = "npm run build:netlify"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"
  NEXT_TELEMETRY_DISABLED = "1"
  NETLIFY = "true"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[dev]
  command = "npm run dev"
  port = 3000
  publish = "out"

# Redirect rules for SPA
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Headers for security and performance
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
    Cache-Control = "public, max-age=3600"
```

### next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
```

## Build Commands

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build:netlify
```

### Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

## Troubleshooting

### Common Issues

1. **Build fails with TypeScript errors**
   - The project is configured to ignore TypeScript build errors
   - Check `next.config.ts` for `ignoreBuildErrors: true`

2. **Static export issues**
   - Ensure all API routes are compatible with static export
   - Use client-side data fetching for dynamic content

3. **Image optimization**
   - Images are set to `unoptimized: true` for static export
   - Consider using external image optimization services

4. **Database connection**
   - Static export doesn't support server-side database connections
   - Use external APIs or serverless functions for database operations

### Deployment Checklist

- [ ] Project name is set to "hanu-youth" in package.json
- [ ] netlify.toml is properly configured
- [ ] next.config.ts has static export enabled
- [ ] All dependencies are installed
- [ ] Prisma client is generated
- [ ] Build completes successfully
- [ ] Environment variables are set in Netlify
- [ ] Redirect rules are working
- [ ] Site is accessible at https://hanu-youth.netlify.app

## Post-Deployment

### Custom Domain

1. In Netlify site settings → Domain management
2. Add your custom domain
3. Update DNS records as instructed by Netlify

### SSL/HTTPS

- Netlify provides automatic SSL certificates
- HTTPS is enabled by default

### Analytics

- Enable Netlify analytics in site settings
- Set up Google Analytics if needed

### Form Handling

- Netlify provides built-in form handling
- Forms will automatically work without additional configuration

## Support

For deployment issues:
1. Check Netlify build logs
2. Review this documentation
3. Contact Netlify support
4. Check project GitHub issues

---

**Note**: This deployment uses static export, which means some dynamic features may need to be implemented using client-side JavaScript or external APIs.