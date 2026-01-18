# Al-Biruni EDU - Deployment Guide

## Vercel Deployment

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Prepare the following:
   - `GEMINI_API_KEY`: Google Gemini API key
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (optional)

### Deployment Steps

#### Option 1: Via Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select "Import Git Repository"
   - Choose your GitHub repository

2. **Configure Project**
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Set Environment Variables**

   Add the following environment variables in the Vercel dashboard:

   ```
   GEMINI_API_KEY=AIzaSyDqYfdFpli93bKMnMvBx_KPTCXMYwOw3F8
   NEXT_PUBLIC_SUPABASE_URL=https://loqhjfpuqjcwsgbfvpkr.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_GpUe5IK5SJJHyvKjvzk2cw_M9nKHmR9
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

#### Option 2: Via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # From project root
   vercel

   # Follow prompts:
   # - Set up and deploy? Yes
   # - Which scope? [Select your team]
   # - Link to existing project? No
   # - Project name: albiruni-edu
   # - Directory: ./
   # - Override settings? No
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add GEMINI_API_KEY production
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Post-Deployment Configuration

#### 1. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `albiruni.edu`)
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning

#### 2. Update Supabase Settings

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to "Site URL"
3. Add redirect URLs:
   ```
   https://your-project.vercel.app/*
   https://your-domain.com/*
   ```

#### 3. Environment Variables Check

Verify all environment variables are set:
```bash
vercel env ls
```

### Continuous Deployment

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

To disable auto-deployment for a branch:
```bash
vercel env add VERCEL_GIT_COMMIT_REF <branch-name>
```

### Build Optimization

The project is configured for optimal Vercel deployment:

- ✅ **Next.js 15** with App Router
- ✅ **Edge Runtime** for API routes (fast global response)
- ✅ **Image Optimization** via Next.js Image component
- ✅ **Font Optimization** with next/font
- ✅ **Automatic Code Splitting**
- ✅ **Static Generation** where possible

### Monitoring & Analytics

1. **Vercel Analytics**
   ```bash
   npm install @vercel/analytics
   ```

   Add to `app/layout.tsx`:
   ```tsx
   import { Analytics } from '@vercel/analytics/react';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

2. **Speed Insights**
   ```bash
   npm install @vercel/speed-insights
   ```

### Troubleshooting

#### Build Fails

1. **Check build logs** in Vercel dashboard
2. **Test build locally**:
   ```bash
   npm run build
   ```
3. **Common issues**:
   - Missing environment variables
   - TypeScript errors
   - Import path issues

#### Runtime Errors

1. **Check Function Logs** in Vercel dashboard
2. **Enable error tracking**:
   ```bash
   npm install @sentry/nextjs
   ```

#### Performance Issues

1. **Enable caching** for API routes:
   ```typescript
   export const revalidate = 60; // Revalidate every 60 seconds
   ```

2. **Use Vercel Edge Config** for fast global data:
   ```bash
   npm install @vercel/edge-config
   ```

### Cost Optimization

Vercel Free Tier includes:
- ✅ 100GB bandwidth/month
- ✅ 6,000 serverless function invocations/day
- ✅ Unlimited deployments
- ✅ Automatic HTTPS

**Estimated Costs** (with Gemini API):
- **Vercel**: Free (Hobby plan) or $20/month (Pro)
- **Gemini API**: ~$5-50/month depending on usage
- **Supabase**: Free (with limits) or $25/month
- **Total**: $0-100/month

### Performance Benchmarks

Expected performance on Vercel:

- **Time to First Byte (TTFB)**: <100ms (global)
- **First Contentful Paint (FCP)**: <1.5s
- **Largest Contentful Paint (LCP)**: <2.5s
- **Total Blocking Time (TBT)**: <200ms
- **Cumulative Layout Shift (CLS)**: <0.1

### Security Checklist

Before going to production:

- [ ] Set all environment variables as secrets
- [ ] Enable Vercel Authentication (if needed)
- [ ] Configure Content Security Policy (already set in next.config.js)
- [ ] Set up Supabase Row Level Security (RLS)
- [ ] Enable rate limiting for API routes
- [ ] Review and update CORS settings
- [ ] Enable Vercel Firewall (Pro plan)

### Support

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Gemini API Documentation**: https://ai.google.dev/docs

### Deployment Checklist

- [ ] All code committed and pushed to GitHub
- [ ] Environment variables prepared
- [ ] Build tested locally (`npm run build`)
- [ ] TypeScript errors resolved (`npm run typecheck`)
- [ ] Linting passed (`npm run lint`)
- [ ] Vercel project created
- [ ] Environment variables added to Vercel
- [ ] Deployment successful
- [ ] App tested on production URL
- [ ] Custom domain configured (optional)
- [ ] Supabase URLs updated
- [ ] Analytics enabled (optional)
- [ ] Monitoring set up (optional)

---

**Ready to Deploy?** 🚀

Run: `vercel --prod` or use the Vercel Dashboard!
