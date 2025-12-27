'use client'

import { useEffect, useState } from 'react'
import { CodeFunction } from '@/lib/types'

interface FunctionDetailsProps {
  function: CodeFunction
}

export default function FunctionDetails({ function: func }: FunctionDetailsProps) {
  const [explanation, setExplanation] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'how' | 'where'>('how')

  useEffect(() => {
    const fetchExplanation = async () => {
      setIsLoading(true)
      setError('')
      try {
        // Build comprehensive code context
        const codeContext = `
// Function: ${func.name}
// File: ${func.file}
// Type: ${func.type}
// Parameters: ${func.params.length > 0 ? func.params.join(', ') : 'none'}

export function ${func.name}(${func.params.length > 0 ? func.params.join(', ') : ''}) {
  // This is a ${func.type} in the codebase
  // It is located at line ${func.line} in ${func.file}
  // Implementation details would be here
}
`.trim()

        console.log('📤 Sending to Routeway.ai:', {
          functionName: func.name,
          codeLength: codeContext.length,
          file: func.file,
        })

        const response = await fetch('/api/explain/function', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            functionName: func.name,
            code: codeContext,
            context: `Located in ${func.file} at line ${func.line}. Type: ${func.type}`,
          }),
        })

        const data = await response.json()
        console.log('📥 Routeway.ai response:', data)

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get explanation')
        }

        if (data.how) {
          setExplanation(data.how)
        } else {
          throw new Error('No explanation in response')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error('❌ Error fetching explanation:', errorMessage)
        setError(errorMessage)
        setExplanation('')
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
              <p className="text-gray-400 text-sm">Loading explanation from Routeway.ai...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm">
            <p className="font-semibold mb-2">Error:</p>
            <p>{error}</p>
          </div>
        ) : (
          <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {activeTab === 'how' 
              ? explanation || 'No explanation available'
              : 'Where It\'s Used feature coming soon'}
          </div>
        )}
      </div>
    </div>
  )
}
