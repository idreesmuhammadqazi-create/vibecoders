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
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchAndParseFiles = async () => {
      setIsLoading(true)
      try {
        console.log('📂 Fetching repository files...')
        const response = await fetch(`/api/repos/${repo.full_name.split('/')[0]}/${repo.name}/files`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch files: ${response.status}`)
        }

        const fileTree = await response.json()
        console.log('📊 Total files in repo:', fileTree.length)

        // Filter for code files (exclude API routes, config, etc.)
        const codeFiles = fileTree
          .filter((file: any) => 
            file.type === 'blob' && 
            /\.(ts|tsx|js|jsx|py|java|go|rs)$/.test(file.path) &&
            !file.path.includes('/api/') &&
            !file.path.includes('route.ts') &&
            !file.path.includes('layout.') &&
            !file.path.includes('page.') &&
            !file.path.includes('.config.') &&
            !file.path.includes('node_modules')
          )
          .map((file: any) => file.path)

        console.log('📝 Code files found:', codeFiles.length)

        // Extract functions from file paths
        const extractedFunctions: CodeFunction[] = []
        const MAX_FILES = 50
        const MAX_FUNCTIONS_PER_FILE = 15

        for (const filePath of codeFiles.slice(0, MAX_FILES)) {
          // Extract function names from file path and content hints
          const fileName = filePath.split('/').pop() || ''
          const fileNameWithoutExt = fileName.replace(/\.(ts|tsx|js|jsx|py|java|go|rs)$/, '')

          // Common patterns for function/component names
          const patterns = [
            // PascalCase (React components)
            /([A-Z][a-zA-Z0-9]*)/g,
            // camelCase (functions)
            /([a-z]+[A-Z][a-zA-Z0-9]*)/g,
          ]

          let functionCount = 0
          const seenNames = new Set<string>()

          for (const pattern of patterns) {
            const matches = fileNameWithoutExt.matchAll(pattern)
            for (const match of matches) {
              const funcName = match[1]
              if (funcName && funcName.length > 2 && !seenNames.has(funcName)) {
                seenNames.add(funcName)
                extractedFunctions.push({
                  id: `${filePath}:${funcName}`,
                  name: funcName,
                  file: filePath,
                  line: 1,
                  type: /^[A-Z]/.test(funcName) ? 'component' : 'function',
                  signature: `${funcName}()`,
                  params: [],
                })
                functionCount++
                if (functionCount >= MAX_FUNCTIONS_PER_FILE) break
              }
            }
            if (functionCount >= MAX_FUNCTIONS_PER_FILE) break
          }
        }

        console.log('✅ Functions extracted:', extractedFunctions.length)
        setFunctions(extractedFunctions)
      } catch (error) {
        console.error('❌ Error fetching files:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAndParseFiles()
  }, [repo])

  const filteredFunctions = functions.filter(func =>
    func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    func.file.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Functions & Components</h2>

      <input
        type="text"
        placeholder="Search functions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm mb-4 focus:outline-none focus:border-white"
      />

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Parsing repository...</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {filteredFunctions.length === 0 ? (
            <p className="text-gray-400 text-sm">No functions found</p>
          ) : (
            filteredFunctions.map(func => (
              <button
                key={func.id}
                onClick={() => onFunctionSelect(func)}
                className="w-full text-left p-2 rounded hover:bg-gray-800 transition text-sm border border-transparent hover:border-gray-700"
              >
                <div className="font-medium text-white">{func.name}</div>
                <div className="text-xs text-gray-500">{func.file}</div>
              </button>
            ))
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 border-t border-gray-800 pt-2">
        <p>Total: {filteredFunctions.length} functions</p>
      </div>
    </div>
  )
}
