'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import RepoSelector from '@/components/RepoSelector'
import FileBrowser from '@/components/FileBrowser'
import DependencyGraph from '@/components/DependencyGraph'
import FunctionDetails from '@/components/FunctionDetails'
import { Repository, CodeFunction } from '@/lib/types'

export default function Dashboard() {
  const router = useRouter()
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [selectedFunction, setSelectedFunction] = useState<CodeFunction | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/repos')
        if (response.status === 401) {
          router.push('/')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/')
      }
    }

    checkAuth()
  }, [router])

  const handleRepoSelect = async (repo: Repository) => {
    console.log('📦 Repository selected:', repo.name)
    setSelectedRepo(repo)
    setSelectedFunction(null)
    setIsLoading(true)
    setError('')

    try {
      // The FileBrowser component will handle fetching files
      // We just need to set the repo
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error selecting repo:', errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark text-light">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">VibeCoders</h1>
              <p className="text-sm text-gray-400">Understand your code with AI</p>
            </div>
            {selectedRepo && (
              <div className="text-right">
                <p className="text-sm font-medium">{selectedRepo.name}</p>
                <p className="text-xs text-gray-400">{selectedRepo.full_name}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Repo & File Browser */}
          <div className="lg:col-span-1 space-y-6">
            <RepoSelector onSelect={handleRepoSelect} />
            {selectedRepo && (
              <FileBrowser repo={selectedRepo} onFunctionSelect={setSelectedFunction} />
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {isLoading && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading repository...</p>
                </div>
              </div>
            )}

            {selectedRepo && !isLoading && (
              <>
                {/* Dependency Graph */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Repository Overview</h2>
                  <DependencyGraph repo={selectedRepo} />
                </div>

                {/* Function Details */}
                {selectedFunction && (
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Function Analysis</h2>
                    <FunctionDetails function={selectedFunction} />
                  </div>
                )}

                {!selectedFunction && (
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
                    <p className="text-gray-400">Select a function from the list to see detailed analysis</p>
                  </div>
                )}
              </>
            )}

            {!selectedRepo && !isLoading && (
              <div className="flex items-center justify-center h-96 bg-gray-900 border border-gray-800 rounded-lg">
                <p className="text-gray-400">Select a repository to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
