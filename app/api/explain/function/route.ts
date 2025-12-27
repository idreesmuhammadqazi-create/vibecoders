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

    console.log('Explain function request:', { functionName, codeLength: code?.length })

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
      console.log('Returning cached explanation')
      return NextResponse.json({
        ...cached,
        cached: true,
      })
    }

    const apiKey = process.env.ROUTEWAY_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    console.log('Calling Routeway.ai API...')

    // Call Routeway.ai API with correct format
    const routewayResponse = await fetch('https://api.routeway.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Use standard model name
        messages: [
          {
            role: 'system',
            content: 'You are a helpful code explanation expert. Explain code clearly and concisely in 2-3 sentences.',
          },
          {
            role: 'user',
            content: `Explain what this function does:\n\n${code}\n\nFunction name: ${functionName}\nContext: ${context || 'N/A'}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    })

    console.log('Routeway.ai response status:', routewayResponse.status)

    // Check if response is OK
    if (!routewayResponse.ok) {
      const contentType = routewayResponse.headers.get('content-type')
      let errorMessage = `HTTP ${routewayResponse.status}`

      if (contentType?.includes('application/json')) {
        try {
          const errorData = await routewayResponse.json()
          errorMessage = errorData.error?.message || JSON.stringify(errorData)
        } catch (e) {
          const text = await routewayResponse.text()
          errorMessage = text.substring(0, 200)
        }
      } else {
        const text = await routewayResponse.text()
        errorMessage = text.substring(0, 200)
      }

      console.error('Routeway.ai error:', errorMessage)
      throw new Error(`Routeway.ai API failed: ${errorMessage}`)
    }

    // Parse response
    const responseData = await routewayResponse.json()
    console.log('Routeway.ai response received')

    if (!responseData.choices || !responseData.choices[0] || !responseData.choices[0].message) {
      console.error('Invalid response structure:', responseData)
      throw new Error('Invalid response from Routeway.ai: missing choices or message')
    }

    const explanation = responseData.choices[0].message.content

    if (!explanation) {
      throw new Error('Empty explanation from Routeway.ai')
    }

    const result = {
      functionName,
      how: explanation,
      timestamp: Date.now(),
    }

    // Cache the result
    cacheManager.set(cacheKey, result)

    console.log('Explanation generated successfully')

    return NextResponse.json({
      ...result,
      cached: false,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Explanation error:', errorMessage)

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
