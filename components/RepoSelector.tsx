'use client'

import { useEffect, useState } from 'react'
import { Repository } from '@/lib/types'

interface RepoSelectorProps {
  onSelect: (repo: Repository) => void
}

export default function RepoSelector({ onSelect }: RepoSelectorProps) {
  const [repos, setRepos] = useState<Repository[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch('/api/repos')
        const data = await response.json()
        setRepos(data)
      } catch (error) {
        console.error('Error fetching repos:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRepos()
  }, [])

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Your Repositories</h2>

      <input
        type="text"
        placeholder="Search repositories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm mb-4 focus:outline-none focus:border-white"
      />

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredRepos.length === 0 ? (
            <p className="text-gray-400 text-sm">No repositories found</p>
          ) : (
            filteredRepos.map(repo => (
              <button
                key={repo.id}
                onClick={() => onSelect(repo)}
                className="w-full text-left p-3 rounded hover:bg-gray-800 transition border border-transparent hover:border-gray-700"
              >
                <div className="font-medium text-sm">{repo.name}</div>
                <div className="text-xs text-gray-400 truncate">{repo.description}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
