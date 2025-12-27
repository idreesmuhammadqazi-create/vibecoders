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
    setSelectedRepo(repo)
    setSelectedFunction(null)
    setIsLoading(true)

    try {
      // Fetch repository files and parse code
      const response = await fetch(`/api/repos/${repo.full_name.split('/')[0]}/${repo.name}/files`)
      await response.json()

      // TODO: Parse files and extract functions
      // For now, we'll show a placeholder
    } catch (error) {
      console.error('Error fetching repo files:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark text-light">
      <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">VibeCoders</h1>
          <p className="text-sm text-gray-400">Understand your code</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
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
                  <h2 className="text-xl font-semibold mb-4">Dependency Graph</h2>
                  <DependencyGraph repo={selectedRepo} />
                </div>

                {/* Function Details */}
                {selectedFunction && (
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Function Details</h2>
                    <FunctionDetails function={selectedFunction} />
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
