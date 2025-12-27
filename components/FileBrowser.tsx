'use client'

import { useEffect, useState } from 'react'
import { Repository, CodeFunction } from '@/lib/types'

interface FileBrowserProps {
  repo: Repository
  onFunctionSelect: (func: CodeFunction) => void
}

export default function FileBrowser({ repo, onFunctionSelect }: FileBrowserProps) {
  const [functions, setFunctions] = useState<CodeFunction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAndParseFiles = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/repos/${repo.full_name.split('/')[0]}/${repo.name}/files`)
        const fileTree = await response.json()

        // Filter for code files
        const codeFiles = fileTree
          .filter((file: any) => 
            file.type === 'blob' && 
            /\.(ts|tsx|js|jsx|py|java|go|rs)$/.test(file.path)
          )
          .map((file: any) => file.path)

        // TODO: Fetch and parse actual file contents
        // For now, we'll show placeholder functions
        const placeholderFunctions: CodeFunction[] = codeFiles.slice(0, 5).map((file: string, idx: number) => ({
          id: `${file}:func${idx}`,
          name: `function${idx}`,
          file,
          line: 1,
          type: 'function',
          signature: `function function${idx}()`,
          params: [],
        }))

        setFunctions(placeholderFunctions)
      } catch (error) {
        console.error('Error fetching files:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAndParseFiles()
  }, [repo])

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Functions</h2>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {functions.length === 0 ? (
            <p className="text-gray-400 text-sm">No functions found</p>
          ) : (
            functions.map(func => (
              <button
                key={func.id}
                onClick={() => onFunctionSelect(func)}
                className="w-full text-left p-2 rounded hover:bg-gray-800 transition text-sm"
              >
                <div className="font-medium">{func.name}</div>
                <div className="text-xs text-gray-400">{func.file}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
