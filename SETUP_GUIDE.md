# VibeCoders - Setup & Deployment Guide

## Quick Start

### 1. Prerequisites
- Node.js 18+ installed
- GitHub account
- OpenAI API key
- GitHub OAuth App (for authentication)

### 2. Environment Setup

Copy the example environment file:
```bash
cp .env.local.example .env.local
```

Fill in your credentials:

#### GitHub OAuth Setup
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App with:
   - **Application name**: VibeCoders
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
3. Copy the Client ID and Client Secret to `.env.local`

#### GitHub Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Create a new token with `repo` and `user` scopes
3. Add to `.env.local` as `GITHUB_TOKEN`

#### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add to `.env.local` as `OPENAI_API_KEY`

#### NextAuth Secret
Generate a random secret:
```bash
openssl rand -base64 32
```
Add to `.env.local` as `NEXTAUTH_SECRET`

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
vibecoders/
├── app/
│   ├── api/
│   │   ├── auth/github/callback/    # GitHub OAuth callback
│   │   ├── repos/                   # Repository endpoints
│   │   │   ├── route.ts             # List user repos
│   │   │   └── [owner]/[repo]/files/route.ts  # Get repo files
│   │   └── explain/
│   │       ├── function/route.ts    # Function explanation
│   │       └── usage/route.ts       # Function usage explanation
│   ├── dashboard/page.tsx           # Main dashboard
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Landing page
│   └── globals.css                  # Global styles
├── components/
│   ├── RepoSelector.tsx             # Repository selection
│   ├── FileBrowser.tsx              # File/function browser
│   ├── DependencyGraph.tsx          # Dependency visualization
│   └── FunctionDetails.tsx          # Function details panel
├── lib/
│   ├── types.ts                     # TypeScript types
│   ├── cache.ts                     # Caching system
│   ├── rateLimit.ts                 # Rate limiting
│   └── codeParser.ts                # Code parsing utilities
├── public/                          # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## Key Features Implemented

### ✅ GitHub Integration
- OAuth authentication flow
- Repository listing
- File tree fetching
- Secure token handling

### ✅ Code Parsing
- Function extraction (regex-based)
- Dependency analysis
- Feature mapping
- Code structure analysis

### ✅ AI Integration
- OpenAI GPT-3.5 Turbo integration
- Function explanation endpoint
- Usage context endpoint
- Error handling

### ✅ Caching System
- 24-hour TTL by default
- Reduces API costs
- Automatic expiration
- In-memory storage

### ✅ Rate Limiting
- 100 requests per hour (configurable)
- Per-IP tracking
- 429 status on limit exceeded
- Configurable via environment

### ✅ Frontend Components
- Modern, clean UI
- Responsive design
- Loading states
- Error handling
- Dark theme

## API Endpoints

### Authentication
```
GET /api/auth/github/callback?code=xxx&state=xxx
```
GitHub OAuth callback endpoint.

### Repositories
```
GET /api/repos
```
List all repositories for authenticated user.

```
GET /api/repos/[owner]/[repo]/files
```
Get file tree for a specific repository.

### Explanations
```
POST /api/explain/function
Content-Type: application/json

{
  "functionName": "myFunction",
  "code": "function myFunction() { ... }",
  "context": "Used in auth module"
}
```
Get AI explanation of how a function works.

```
POST /api/explain/usage
Content-Type: application/json

{
  "functionName": "myFunction",
  "usageContext": "Called from login.ts",
  "codeSnippets": "..."
}
```
Get AI explanation of where and why a function is used.

## Configuration

### Environment Variables
```
# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_TOKEN=your_personal_access_token

# OpenAI
OPENAI_API_KEY=your_openai_key

# NextAuth
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=3600000
```

### Tailwind Configuration
Customize colors and theme in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      dark: '#0f0f0f',
      light: '#ffffff',
    },
  },
}
```

## Development

### Build for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

### Code Structure
- **Components**: Reusable React components in `/components`
- **API Routes**: Next.js API routes in `/app/api`
- **Utilities**: Helper functions in `/lib`
- **Types**: TypeScript types in `/lib/types.ts`

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker
Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t vibecoders .
docker run -p 3000:3000 --env-file .env.local vibecoders
```

### Self-Hosted
1. Install Node.js 18+
2. Clone repository
3. Install dependencies: `npm install`
4. Build: `npm run build`
5. Set environment variables
6. Start: `npm start`
7. Use PM2 or systemd for process management

## Troubleshooting

### GitHub OAuth Issues
- Verify callback URL matches exactly in GitHub settings
- Check Client ID and Secret are correct
- Ensure NEXTAUTH_URL is set correctly

### OpenAI API Errors
- Verify API key is valid
- Check rate limits haven't been exceeded
- Ensure sufficient API credits

### Rate Limiting
- Check IP address in logs
- Adjust `RATE_LIMIT_REQUESTS` if needed
- Clear rate limit cache if stuck

### Build Errors
- Delete `node_modules` and `.next` folder
- Run `npm install` again
- Check Node.js version (18+)

## Performance Optimization

### Caching
- Explanations cached for 24 hours
- Reduces OpenAI API calls
- Improves response times

### Code Splitting
- Next.js automatic code splitting
- Dynamic imports for heavy components
- Optimized bundle size

### Database
- Currently in-memory caching
- Consider Redis for production
- Add persistent storage if needed

## Security Considerations

1. **API Keys**: Never commit `.env.local` to git
2. **Rate Limiting**: Prevents abuse and API cost overruns
3. **CORS**: Configure as needed for production
4. **HTTPS**: Use in production
5. **Token Storage**: Secure httpOnly cookies
6. **Input Validation**: Validate all API inputs

## Future Enhancements

- [ ] Tree-sitter for better code parsing
- [ ] Support for more languages (Python, Java, Go, Rust)
- [ ] Advanced dependency visualization
- [ ] Code quality metrics
- [ ] Test coverage analysis
- [ ] Performance profiling
- [ ] Collaborative features
- [ ] Export functionality
- [ ] Redis caching
- [ ] Database integration

## Support & Contributing

For issues, questions, or contributions, please open an issue on GitHub.

## License

MIT License - see LICENSE file for details
