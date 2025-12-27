# VibeCoders - Understand Your Code

A modern web tool that helps developers understand their GitHub repositories by exploring functions, dependencies, and features with AI-powered explanations.

## Features

- **GitHub Integration**: Connect your GitHub account and select any repository
- **Function Exploration**: Browse all functions in your codebase
- **Dependency Visualization**: See how files and functions connect
- **AI Explanations**: Get detailed explanations of how functions work
- **Usage Tracking**: Understand where and why functions are used
- **Feature Mapping**: See which code belongs to which feature
- **Smart Caching**: Reduce API costs with intelligent caching
- **Rate Limiting**: Prevent abuse with built-in rate limiting

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Code Parsing**: Custom regex-based parser (extensible to Tree-sitter)
- **AI**: OpenAI GPT-3.5 Turbo
- **Authentication**: GitHub OAuth
- **Visualization**: Reactflow (for dependency graphs)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- GitHub OAuth App credentials
- OpenAI API key

### Installation

1. Clone the repository:
```bash
cd vibecoders
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Fill in your credentials in `.env.local`:
```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
OPENAI_API_KEY=your_openai_api_key
NEXTAUTH_SECRET=your_secret_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
vibecoders/
├── app/
│   ├── api/
│   │   ├── auth/          # GitHub OAuth
│   │   ├── repos/         # Repository endpoints
│   │   └── explain/       # AI explanation endpoints
│   ├── dashboard/         # Main dashboard page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/
│   ├── RepoSelector.tsx   # Repository selection
│   ├── FileBrowser.tsx    # File/function browser
│   ├── DependencyGraph.tsx # Dependency visualization
│   └── FunctionDetails.tsx # Function details panel
├── lib/
│   ├── types.ts           # TypeScript types
│   ├── cache.ts           # Caching system
│   ├── rateLimit.ts       # Rate limiting
│   └── codeParser.ts      # Code parsing utilities
└── public/                # Static assets
```

## API Endpoints

### Authentication
- `GET /api/auth/github/callback` - GitHub OAuth callback

### Repositories
- `GET /api/repos` - List user repositories
- `GET /api/repos/[owner]/[repo]/files` - Get repository file tree

### Explanations
- `POST /api/explain/function` - Get function explanation
- `POST /api/explain/usage` - Get function usage explanation

## Features in Detail

### 1. Function Exploration
- Browse all functions in your repository
- See function signatures and parameters
- Jump to function definitions

### 2. How It Works
- AI-powered explanations of function logic
- Step-by-step breakdown of implementation
- Context-aware descriptions

### 3. Where It's Used
- See all files that call a function
- Understand the purpose in each context
- Trace function call chains

### 4. Feature Mapping
- Automatically organize code by features
- See which files belong to which feature
- Understand feature structure

### 5. Dependency Graph
- Interactive visualization of file dependencies
- Function call relationships
- Visual code structure

## Caching System

The application includes an intelligent caching system that:
- Stores AI explanations for 24 hours
- Reduces OpenAI API costs
- Improves response times
- Automatically expires old entries

## Rate Limiting

Built-in rate limiting prevents abuse:
- Default: 100 requests per hour per IP
- Configurable via environment variables
- Returns 429 status when limit exceeded

## Future Enhancements

- [ ] Tree-sitter integration for better code parsing
- [ ] Support for more programming languages
- [ ] Advanced dependency graph visualization
- [ ] Code quality metrics
- [ ] Test coverage analysis
- [ ] Performance profiling
- [ ] Collaborative features
- [ ] Export functionality

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.
