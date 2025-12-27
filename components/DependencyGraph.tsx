'use client'

import { useEffect, useState } from 'react'
import { Repository } from '@/lib/types'

interface DependencyGraphProps {
  repo: Repository
}

export default function DependencyGraph({ repo }: DependencyGraphProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [repo])

  return (
    <div className="w-full h-96 bg-gray-800 rounded border border-gray-700 flex items-center justify-center">
      {isLoading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Building dependency graph...</p>
        </div>
      ) : (
        <div className="text-center text-gray-400">
          <p className="text-sm">Dependency graph visualization</p>
          <p className="text-xs text-gray-500 mt-2">Interactive graph will appear here</p>
        </div>
      )}
    </div>
  )
}
