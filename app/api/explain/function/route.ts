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

    console.log('Explain function request:', { functionName, codeLength: code?.length, context })

    if (!functionName || !code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check cache
    const cacheKey = generateCacheKey('function_explanation', functionName, code)
    const cached = cacheManager.get(cacheKey)

    if (cached) {
      return NextResponse.json({
        ...cached,
        cached: true,
      })
    }

    // Call Routeway.ai API
    const routewayResponse = await fetch('https://api.routeway.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ROUTEWAY_API_KEY}`,
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
            content: `Explain this function in detail. Describe HOW it works step by step:\n\n${code}\n\nContext: ${context || 'No additional context'}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!routewayResponse.ok) {
      const errorData = await routewayResponse.json()
      console.error('Routeway.ai error response:', errorData)
      throw new Error(`Routeway.ai API error: ${errorData.error?.message || JSON.stringify(errorData)}`)
    }

    const routewayData = await routewayResponse.json()
    console.log('Routeway.ai success response:', { choices: routewayData.choices?.length })
    
    if (!routewayData.choices || !routewayData.choices[0]) {
      throw new Error('Invalid response from Routeway.ai: no choices')
    }

    const explanation = routewayData.choices[0].message.content

    const result = {
      functionName,
      how: explanation,
      timestamp: Date.now(),
    }

    // Cache the result
    cacheManager.set(cacheKey, result)

    return NextResponse.json({
      ...result,
      cached: false,
    })
  } catch (error) {
    console.error('Explanation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    )
  }
}
