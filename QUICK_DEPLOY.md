# 🚀 Quick Deploy to Vercel

## Prerequisites

✅ Code is committed to Git
✅ Environment variables ready:
- `GEMINI_API_KEY`: AIzaSyDqYfdFpli93bKMnMvBx_KPTCXMYwOw3F8
- `NEXT_PUBLIC_SUPABASE_URL`: https://loqhjfpuqjcwsgbfvpkr.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: sb_publishable_GpUe5IK5SJJHyvKjvzk2cw_M9nKHmR9

## Deploy in 3 Steps

### 1️⃣ Login to Vercel

```bash
npx vercel login
```

This will open your browser. Choose your preferred login method (GitHub, GitLab, Bitbucket, or Email).

### 2️⃣ Deploy

**For Preview (Test):**
```bash
npm run deploy:preview
```

**For Production:**
```bash
npm run deploy:prod
```

**Or use the automated script:**
```bash
npm run deploy
```

### 3️⃣ Set Environment Variables

After first deployment, set your secrets:

```bash
# Set Gemini API Key
vercel env add GEMINI_API_KEY production
# Paste: AIzaSyDqYfdFpli93bKMnMvBx_KPTCXMYwOw3F8

# Set Supabase URL
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://loqhjfpuqjcwsgbfvpkr.supabase.co

# Set Supabase Anon Key
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste: sb_publishable_GpUe5IK5SJJHyvKjvzk2cw_M9nKHmR9
```

## Alternative: Deploy via Dashboard

1. **Go to Vercel**: https://vercel.com/new
2. **Import Git Repository**: Connect your GitHub repo
3. **Configure**:
   - Framework: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
4. **Add Environment Variables** (see above)
5. **Click Deploy** 🚀

## After Deployment

✅ Your app will be live at: `https://your-project.vercel.app`
✅ Every push to `main` branch auto-deploys to production
✅ Pull requests get preview deployments automatically

## Verify Deployment

Visit these routes to test:

- **Homepage**: `https://your-project.vercel.app/`
- **UI Demo**: `https://your-project.vercel.app/ui-demo`
- **Chat Demo**: `https://your-project.vercel.app/chat-demo`
- **API Health**: `https://your-project.vercel.app/api/agents`

## Troubleshooting

### Build fails?
```bash
# Test build locally first
npm run build
```

### Environment variables not working?
```bash
# List all environment variables
vercel env ls

# Pull environment variables to local
vercel env pull
```

### Need to redeploy?
```bash
# Trigger new deployment
vercel --prod --force
```

## Support

- 📖 Full Guide: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- 💬 Vercel Discord: https://vercel.com/discord
- 📚 Vercel Docs: https://vercel.com/docs

---

**Ready? Let's deploy! 🚀**

```bash
npm run deploy
```
