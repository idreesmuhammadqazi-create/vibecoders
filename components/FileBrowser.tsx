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
        const [owner, repoName] = repo.full_name.split('/')
        const response = await fetch(`/api/repos/${owner}/${repoName}/files`)
        const fileTree = await response.json()

        // Filter for code files
        const codeFiles = fileTree
          .filter((file: any) => 
            file.type === 'blob' && 
            /\.(ts|tsx|js|jsx)$/.test(file.path)
          )
          .map((file: any) => file.path)

        console.log('Found code files:', codeFiles)

        // Fetch and parse actual file contents
        const allFunctions: CodeFunction[] = []
        const MAX_FILES = 50 // Configurable limit
        const MAX_FUNCTIONS_PER_FILE = 10 // Configurable limit
        
        for (const filePath of codeFiles.slice(0, MAX_FILES)) {
          try {
            const fileResponse = await fetch(`/api/repos/${owner}/${repoName}/file?path=${encodeURIComponent(filePath)}`)
            if (!fileResponse.ok) continue
            
            const fileContent = await fileResponse.text()
            
            // Simple regex to find function names
            const functionMatches = fileContent.matchAll(/(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(/g)
            
            let matchIndex = 0
            for (const match of functionMatches) {
              const funcName = match[1] || match[2]
              if (funcName) {
                allFunctions.push({
                  id: `${filePath}:${funcName}`,
                  name: funcName,
                  file: filePath,
                  line: 1,
                  type: 'function',
                  signature: `function ${funcName}()`,
                  params: [],
                })
                matchIndex++
                if (matchIndex >= MAX_FUNCTIONS_PER_FILE) break
              }
            }
          } catch (error) {
            console.error(`Error fetching file ${filePath}:`, error)
          }
        }

        console.log('Parsed functions:', allFunctions)
        setFunctions(allFunctions.length > 0 ? allFunctions : [])
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
