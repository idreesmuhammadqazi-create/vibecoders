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

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
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

    if (!openaiResponse.ok) {
      throw new Error('OpenAI API error')
    }

    const openaiData = await openaiResponse.json()
    const explanation = openaiData.choices[0].message.content

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
