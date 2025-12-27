# VibeCoders - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Clone & Install
```bash
cd vibecoders
npm install
```

### Step 2: Set Up Environment
```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add:
```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_TOKEN=your_github_token
OPENAI_API_KEY=your_openai_key
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### Step 3: Run Development Server
```bash
npm run dev
```

### Step 4: Open Browser
Visit: `http://localhost:3000`

## 📋 Common Commands

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm start                # Start production server

# Linting
npm run lint             # Run ESLint

# Cleanup
rm -rf node_modules .next
npm install              # Fresh install
```

## 🔑 Getting API Keys

### GitHub OAuth App
1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Application name: `VibeCoders`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/github/callback`
4. Copy Client ID and Client Secret

### GitHub Personal Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token"
3. Select scopes: `repo`, `user`
4. Copy the token

### OpenAI API Key
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key

### NextAuth Secret
```bash
openssl rand -base64 32
```

## 📁 Project Structure

```
vibecoders/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard page
│   └── page.tsx        # Landing page
├── components/         # React components
├── lib/                # Utilities and helpers
├── public/             # Static files
└── package.json        # Dependencies
```

## 🎯 Main Features

| Feature | Location | Status |
|---------|----------|--------|
| GitHub OAuth | `/app/api/auth/` | ✅ Ready |
| Repo Listing | `/app/api/repos/` | ✅ Ready |
| Code Parsing | `/lib/codeParser.ts` | ✅ Ready |
| AI Explanations | `/app/api/explain/` | ✅ Ready |
| Caching | `/lib/cache.ts` | ✅ Ready |
| Rate Limiting | `/lib/rateLimit.ts` | ✅ Ready |
| Dashboard UI | `/app/dashboard/` | ✅ Ready |

## 🔧 Configuration

### Environment Variables
```
GITHUB_CLIENT_ID          # GitHub OAuth Client ID
GITHUB_CLIENT_SECRET      # GitHub OAuth Client Secret
GITHUB_TOKEN              # GitHub Personal Access Token
OPENAI_API_KEY            # OpenAI API Key
NEXTAUTH_SECRET           # NextAuth Secret
NEXTAUTH_URL              # App URL (http://localhost:3000)
RATE_LIMIT_REQUESTS       # Requests per window (default: 100)
RATE_LIMIT_WINDOW_MS      # Time window in ms (default: 3600000)
```

### Tailwind Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  dark: '#0f0f0f',
  light: '#ffffff',
}
```

## 📚 API Endpoints

### Get Repositories
```bash
curl http://localhost:3000/api/repos \
  -H "Cookie: github_token=your_token"
```

### Get Repository Files
```bash
curl http://localhost:3000/api/repos/owner/repo/files \
  -H "Cookie: github_token=your_token"
```

### Explain Function
```bash
curl -X POST http://localhost:3000/api/explain/function \
  -H "Content-Type: application/json" \
  -d '{
    "functionName": "myFunc",
    "code": "function myFunc() { ... }",
    "context": "Used in auth"
  }'
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Clear Cache
```bash
rm -rf .next
npm run dev
```

### Fresh Install
```bash
rm -rf node_modules package-lock.json
npm install
```

### Check Node Version
```bash
node --version  # Should be 18+
```

## 📦 Dependencies

### Core
- `next` - React framework
- `react` - UI library
- `typescript` - Type safety
- `tailwindcss` - Styling

### API
- `octokit` - GitHub API
- `axios` - HTTP client
- `jose` - JWT handling

### UI
- `reactflow` - Dependency graphs
- `zustand` - State management

## 🚀 Deployment

### Vercel
```bash
# Push to GitHub
git push origin main

# Connect to Vercel
# Add environment variables in Vercel dashboard
# Deploy automatically
```

### Docker
```bash
docker build -t vibecoders .
docker run -p 3000:3000 --env-file .env.local vibecoders
```

### Self-Hosted
```bash
npm run build
npm start
```

## 📖 Documentation

- `README.md` - Project overview
- `SETUP_GUIDE.md` - Detailed setup
- `BUILD_SUMMARY.md` - What was built
- `QUICK_START.md` - This file

## 💡 Tips

1. **Development**: Use `npm run dev` for hot reload
2. **Debugging**: Check browser console and terminal logs
3. **API Testing**: Use curl or Postman
4. **Caching**: Explanations cached for 24 hours
5. **Rate Limiting**: 100 requests/hour per IP

## 🎓 Learning

This project demonstrates:
- Next.js App Router
- TypeScript
- React Hooks
- API Routes
- OAuth 2.0
- Caching
- Rate Limiting
- Responsive Design

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📞 Support

- Check documentation files
- Review code comments
- Check Next.js docs
- Open GitHub issue

## ✨ Next Steps

1. ✅ Set up environment
2. ✅ Run development server
3. ✅ Test GitHub login
4. ✅ Explore a repository
5. ✅ Get function explanations
6. 🔄 Customize and deploy

---

**Ready to explore your code? Let's go! 🚀**
