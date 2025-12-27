'use client'

import { useState } from 'react'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGitHubLogin = async () => {
    setIsLoading(true)
    try {
      // Redirect to GitHub OAuth
      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
      const redirectUri = `${window.location.origin}/api/auth/github/callback`
      const scope = 'repo,user'
      
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-dark flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center animate-fade-in">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            VibeCoders
          </h1>
          <p className="text-xl text-gray-400 mb-2">
            Understand Your Code Like Never Before
          </p>
          <p className="text-gray-500">
            Explore functions, dependencies, and features in your GitHub repositories
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-semibold mb-2">Function Usage</h3>
            <p className="text-sm text-gray-400">
              See where and why functions are used across your codebase
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition">
            <div className="text-3xl mb-3">⚙️</div>
            <h3 className="font-semibold mb-2">How It Works</h3>
            <p className="text-sm text-gray-400">
              Get detailed explanations of function logic and implementation
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition">
            <div className="text-3xl mb-3">📁</div>
            <h3 className="font-semibold mb-2">Feature Mapping</h3>
            <p className="text-sm text-gray-400">
              Understand which code belongs to which feature
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleGitHubLogin}
          disabled={isLoading}
          className="bg-white text-dark font-semibold py-3 px-8 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {isLoading ? 'Connecting...' : 'Connect with GitHub'}
        </button>

        {/* Footer */}
        <p className="text-sm text-gray-500">
          No account needed. We only access your public repositories.
        </p>
      </div>
    </main>
  )
}
