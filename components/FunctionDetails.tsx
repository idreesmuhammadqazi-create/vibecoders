'use client'

import { useEffect, useState } from 'react'
import { CodeFunction } from '@/lib/types'

interface FunctionDetailsProps {
  function: CodeFunction
}

export default function FunctionDetails({ function: func }: FunctionDetailsProps) {
  const [explanation, setExplanation] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'how' | 'where'>('how')

  useEffect(() => {
    const fetchExplanation = async () => {
      setIsLoading(true)
      try {
        // First, fetch the actual file content
        const [owner, repo] = func.file.split('/').slice(0, 2)
        const fileResponse = await fetch(`/api/repos/${owner}/${repo}/file?path=${encodeURIComponent(func.file)}`)
        
        let code = `function ${func.name}(${func.params.join(', ')}) { /* implementation */ }`
        
        if (fileResponse.ok) {
          const fileContent = await fileResponse.text()
          console.log('File content length:', fileContent.length)
          console.log('Looking for function:', func.name)
          
          // Simple approach: find the function name and grab surrounding code
          const funcIndex = fileContent.indexOf(func.name)
          if (funcIndex !== -1) {
            // Get 200 chars before and 800 chars after
            const start = Math.max(0, funcIndex - 200)
            const end = Math.min(fileContent.length, funcIndex + 800)
            code = fileContent.substring(start, end)
            console.log('Extracted code length:', code.length)
          }
        } else {
          console.error('File fetch failed:', fileResponse.status)
        }

        console.log('Sending to Routeway.ai:', { functionName: func.name, codeLength: code.length })

        const response = await fetch('/api/explain/function', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            functionName: func.name,
            code,
            context: `Located in ${func.file}`,
          }),
        })

        const data = await response.json()
        console.log('Routeway.ai response:', data)
        
        if (data.how) {
          setExplanation(data.how)
        } else if (data.error) {
          setExplanation(`Error: ${data.error}`)
        } else {
          setExplanation('No explanation available')
        }
      } catch (error) {
        console.error('Error fetching explanation:', error)
        setExplanation(`Failed to load explanation: ${error}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchExplanation()
  }, [func])

  return (
    <div className="space-y-4">
      {/* Function Header */}
      <div className="bg-gray-800 rounded p-4 border border-gray-700">
        <h3 className="text-lg font-semibold mb-2">{func.name}</h3>
        <div className="text-sm text-gray-400 space-y-1">
          <p><span className="text-gray-500">File:</span> {func.file}</p>
          <p><span className="text-gray-500">Line:</span> {func.line}</p>
          <p><span className="text-gray-500">Type:</span> {func.type}</p>
          {func.params.length > 0 && (
            <p><span className="text-gray-500">Parameters:</span> {func.params.join(', ')}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('how')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'how'
              ? 'border-white text-white'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          How It Works
        </button>
        <button
          onClick={() => setActiveTab('where')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'where'
              ? 'border-white text-white'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Where It's Used
        </button>
      </div>

      {/* Content */}
      <div className="bg-gray-800 rounded p-4 border border-gray-700 min-h-48">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Loading explanation...</p>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {activeTab === 'how' ? explanation : 'No usage information available'}
          </div>
        )}
      </div>
    </div>
  )
}
