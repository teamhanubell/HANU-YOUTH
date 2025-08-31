# HANU-YOUTH Platform - Netlify Deployment Guide

## 🚀 Deploy HANU-YOUTH on Netlify

This guide will help you deploy the HANU-YOUTH platform on Netlify with automated CI/CD pipeline.

## 📋 Prerequisites

- Node.js 18 or higher
- Git repository with your project
- Netlify account (free tier available)
- GitHub, GitLab, or Bitbucket account for automatic deployment

## 🛠️ Quick Deployment

### Method 1: Automatic Deployment (Recommended)

1. **Push your code to a Git repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "New site from Git"
   - Select your Git provider
   - Choose your repository
   - Configure build settings:
     - **Build command**: `npm run build:netlify`
     - **Publish directory**: `.next`
     - **Node version**: `18`

3. **Set Environment Variables**
   In your Netlify site settings → Environment variables:
   ```env
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   ```

4. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your site

### Method 2: Manual Deployment

1. **Prepare your project locally**
   ```bash
   # Install dependencies
   npm install

   # Generate Prisma client
   npm run db:generate

   # Build for Netlify
   npm run build:netlify
   ```

2. **Deploy via Netlify CLI**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Login to Netlify
   netlify login

   # Deploy
   netlify deploy --prod --dir=.next
   ```

## ⚙️ Configuration Files

### `netlify.toml`
The project includes a pre-configured `netlify.toml` file with:
- Build settings
- Environment variables
- Redirect rules for SPA
- Security headers
- Caching strategies

### `next.config.ts`
Modified for static export:
- `output: 'export'` - Enables static export
- `images: { unoptimized: true }` - Disables image optimization for static export
- `trailingSlash: false` - Clean URLs

## 🔧 Environment Variables

Set these in your Netlify dashboard:

### Required Variables
```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Optional Variables (for enhanced functionality)
```env
# Database (if using external database)
DATABASE_URL=your_database_url

# Firebase (if using Firebase services)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id

# AI Services (if using AI features)
OPENAI_API_KEY=your_openai_api_key
ZAI_API_KEY=your_zai_api_key

# Authentication (if using NextAuth)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-site.netlify.app
```

## 🚀 Deployment Scripts

### Unix/macOS
```bash
./deploy-netlify.sh
```

### Windows
```bash
deploy-netlify.bat
```

These scripts will:
- Check Node.js version
- Install dependencies
- Generate Prisma client
- Build the project
- Verify output

## 🌐 Custom Domain

1. **In Netlify Dashboard**:
   - Go to Site settings → Domain management
   - Add your custom domain
   - Update DNS settings as instructed

2. **Update Configuration**:
   If using a custom domain, update `next.config.ts`:
   ```javascript
   basePath: '',
   assetPrefix: 'https://your-custom-domain.com',
   ```

## 🔒 Security Features

The deployment includes:
- Security headers (XSS protection, frame options)
- Content Security Policy
- Proper caching strategies
- HTTPS enforcement
- Environment variable protection

## 📊 Monitoring

### Netlify Analytics
- Enable in Site settings → Analytics
- Track visitor metrics, bandwidth, and performance

### Build Logs
- Monitor build status in Netlify dashboard
- Check deployment logs for troubleshooting

## 🐛 Troubleshooting

### Common Issues

**1. Build fails with "Cannot find module"**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**2. Static export issues**
- Ensure all API routes are client-side only
- Check for server-side code in components
- Use `use client` directive for client components

**3. Image optimization errors**
- Images are set to `unoptimized: true` for static export
- Use standard HTML image tags if needed

**4. Routing issues**
- All routes should work with client-side navigation
- Check `next.config.ts` redirect rules

### Debug Commands

```bash
# Test build locally
npm run build:netlify

# Check build output
ls -la .next/

# Test static files
python -m http.server 8000 -d .next
```

## 🔄 CI/CD Pipeline

The project is configured for automatic deployment:

### Automatic Triggers
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployments

### Branch Protection
1. In Git provider settings:
   - Enable branch protection for `main`
   - Require PRs for changes
   - Require status checks

### Deployment Preview
- Every PR gets a preview URL
- Test changes before merging to production

## 📈 Performance Optimization

### Built-in Optimizations
- Static site generation
- Image optimization (disabled for static export)
- Code splitting
- Lazy loading
- Caching headers

### Additional Optimizations
- Enable Brotli compression in Netlify settings
- Use Netlify Edge Functions for API routes
- Implement CDN for static assets

## 🎯 Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] All navigation links work
- [ ] Forms and interactive elements function
- [ ] Mobile responsiveness verified
- [ ] Environment variables set correctly
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Analytics enabled
- [ ] Build monitoring configured

## 📚 Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Next.js Static Export Guide](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports)
- [Netlify Next.js Plugin](https://github.com/netlify/netlify-plugin-nextjs)

## 🆘 Support

If you encounter issues:
1. Check Netlify build logs
2. Review this guide
3. Check Next.js documentation
4. Contact Netlify support

---

**🎉 Congratulations! Your HANU-YOUTH platform is now ready for Netlify deployment!**