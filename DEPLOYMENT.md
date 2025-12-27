# VibeCoders - Vercel Deployment Guide

## 🚀 Deploy to Vercel in 5 Minutes

### Prerequisites
- GitHub account with the vibecoders repository
- Vercel account (free at vercel.com)
- API keys ready:
  - GitHub OAuth Client ID & Secret
  - GitHub Personal Access Token
  - OpenAI API Key

### Step 1: Push to GitHub

The code is already initialized as a git repository. Now push it to GitHub:

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/vibecoders.git

# Rename branch to main (Vercel default)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select "Import Git Repository"
4. Paste your GitHub repository URL
5. Click "Import"

### Step 3: Configure Environment Variables

In the Vercel dashboard, add these environment variables:

```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_TOKEN=your_github_personal_access_token
OPENAI_API_KEY=your_openai_api_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-vercel-url.vercel.app
```

**Important**: Replace `your-vercel-url` with your actual Vercel deployment URL (shown after first deploy).

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (usually 2-3 minutes)
3. Your app is live! 🎉

### Step 5: Update GitHub OAuth Callback URL

After deployment, update your GitHub OAuth App:

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Edit your VibeCoders OAuth App
3. Update "Authorization callback URL" to:
   ```
   https://your-vercel-url.vercel.app/api/auth/github/callback
   ```

## 📋 Environment Variables Explained

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | GitHub Settings → Developer settings → OAuth Apps |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret | GitHub Settings → Developer settings → OAuth Apps |
| `GITHUB_TOKEN` | GitHub Personal Access Token | GitHub Settings → Developer settings → Personal access tokens |
| `OPENAI_API_KEY` | OpenAI API Key | https://platform.openai.com/api-keys |
| `NEXTAUTH_SECRET` | Random secret for NextAuth | Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Vercel deployment URL | Shown in Vercel dashboard |

## 🔄 Continuous Deployment

After initial setup, every push to `main` branch automatically deploys:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main

# Vercel automatically builds and deploys!
```

## 🔍 Monitoring Deployment

### View Logs
1. Go to Vercel dashboard
2. Select your project
3. Click "Deployments"
4. Click on a deployment to see logs

### Check Status
- Green checkmark = Deployment successful
- Red X = Deployment failed (check logs)

## 🐛 Troubleshooting

### Build Fails
1. Check Vercel build logs
2. Ensure all environment variables are set
3. Verify Node.js version (18+)
4. Check for TypeScript errors

### GitHub OAuth Not Working
1. Verify callback URL matches exactly
2. Check Client ID and Secret are correct
3. Ensure NEXTAUTH_URL is set correctly
4. Clear browser cookies and try again

### OpenAI API Errors
1. Verify API key is valid
2. Check API key has sufficient credits
3. Ensure rate limits haven't been exceeded
4. Check API key permissions

### Environment Variables Not Loading
1. Verify variables are set in Vercel dashboard
2. Redeploy after adding variables
3. Check variable names match exactly
4. Ensure no extra spaces in values

## 📊 Vercel Features

### Free Tier Includes
- Unlimited deployments
- Automatic HTTPS
- Global CDN
- Serverless functions
- 100GB bandwidth/month
- 12 concurrent builds

### Paid Tier (if needed)
- More concurrent builds
- Priority support
- Advanced analytics
- Custom domains

## 🔐 Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Use Vercel environment variables** - Not in code
3. **Rotate API keys regularly** - Every 90 days
4. **Monitor API usage** - Check OpenAI dashboard
5. **Enable branch protection** - Require reviews before merge

## 📈 Performance Tips

1. **Monitor build time** - Should be < 5 minutes
2. **Check function duration** - API routes should be < 60s
3. **Use caching** - Already implemented (24-hour TTL)
4. **Optimize images** - Use Next.js Image component
5. **Monitor API costs** - Check OpenAI usage

## 🚀 Next Steps After Deployment

1. ✅ Test GitHub login
2. ✅ Test repository browsing
3. ✅ Test function explanations
4. ✅ Monitor API usage
5. ✅ Set up error tracking (Sentry, etc.)
6. ✅ Configure custom domain (optional)
7. ✅ Set up analytics (optional)

## 📞 Support

### Vercel Support
- Docs: https://vercel.com/docs
- Status: https://www.vercel-status.com
- Community: https://github.com/vercel/next.js/discussions

### Next.js Support
- Docs: https://nextjs.org/docs
- GitHub: https://github.com/vercel/next.js

### Your Project
- README.md - Project overview
- SETUP_GUIDE.md - Local setup
- QUICK_START.md - Quick reference

## 🎉 You're Deployed!

Your VibeCoders app is now live on Vercel! Share the URL with your team and start exploring code together.

---

**Deployment URL**: `https://your-vercel-url.vercel.app`

**Happy coding! 🚀**
