import { NextRequest, NextResponse } from 'next/server'
import { cacheManager, generateCacheKey } from '@/lib/cache'
import { rateLimiter } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown'

  // Rate limiting
  if (!rateLimiter.isAllowed(clientIp)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }

  try {
    const { functionName, code, context } = await request.json()

    console.log('📝 Explain function request:', { functionName, codeLength: code?.length })

    if (!functionName || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: functionName and code' },
        { status: 400 }
      )
    }

    // Check cache
    const cacheKey = generateCacheKey('function_explanation', functionName, code)
    const cached = cacheManager.get(cacheKey)

    if (cached) {
      console.log('✅ Returning cached explanation')
      return NextResponse.json({
        ...cached,
        cached: true,
      })
    }

    const apiKey = process.env.ROUTEWAY_API_KEY

    if (!apiKey) {
      console.error('❌ ROUTEWAY_API_KEY not configured')
      return NextResponse.json(
        { error: 'API key not configured. Please set ROUTEWAY_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    console.log('🚀 Calling Routeway.ai API with glm-4.6:free model...')

    // Call Routeway.ai API - EXACT FORMAT FROM CURL COMMAND
    const routewayResponse = await fetch('https://api.routeway.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'glm-4.6:free',
        messages: [
          {
            role: 'system',
            content: 'You are a code explanation expert. Explain code clearly and concisely.',
          },
          {
            role: 'user',
            content: `Explain what this function does:\n\nFunction: ${functionName}\nCode:\n${code}\n\nContext: ${context || 'N/A'}\n\nProvide a clear, concise explanation of how this function works.`,
          },
        ],
      }),
    })

    console.log('📊 Routeway.ai response status:', routewayResponse.status)

    // Check if response is OK
    if (!routewayResponse.ok) {
      const contentType = routewayResponse.headers.get('content-type')
      let errorMessage = `HTTP ${routewayResponse.status}`

      try {
        if (contentType?.includes('application/json')) {
          const errorData = await routewayResponse.json()
          errorMessage = errorData.error?.message || JSON.stringify(errorData)
          console.error('❌ Routeway.ai JSON error:', errorData)
        } else {
          const text = await routewayResponse.text()
          errorMessage = text.substring(0, 300)
          console.error('❌ Routeway.ai non-JSON error:', errorMessage)
        }
      } catch (parseError) {
        console.error('❌ Error parsing Routeway.ai response:', parseError)
      }

      throw new Error(`Routeway.ai API error (${routewayResponse.status}): ${errorMessage}`)
    }

    // Parse response
    const responseData = await routewayResponse.json()
    console.log('✅ Routeway.ai response received')

    // Validate response structure
    if (!responseData.choices || !Array.isArray(responseData.choices) || responseData.choices.length === 0) {
      console.error('❌ Invalid response structure - no choices:', responseData)
      throw new Error('Invalid response from Routeway.ai: missing choices array')
    }

    const firstChoice = responseData.choices[0]
    if (!firstChoice.message || !firstChoice.message.content) {
      console.error('❌ Invalid choice structure:', firstChoice)
      throw new Error('Invalid response from Routeway.ai: missing message content')
    }

    const explanation = firstChoice.message.content.trim()

    if (!explanation) {
      throw new Error('Empty explanation received from Routeway.ai')
    }

    console.log('✅ Explanation generated successfully')
    console.log('📝 Explanation length:', explanation.length)

    const result = {
      functionName,
      how: explanation,
      timestamp: Date.now(),
    }

    // Cache the result for 24 hours
    cacheManager.set(cacheKey, result, 24 * 60 * 60 * 1000)

    return NextResponse.json({
      ...result,
      cached: false,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ Explanation error:', errorMessage)

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
