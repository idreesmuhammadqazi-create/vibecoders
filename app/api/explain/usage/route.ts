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
    const { functionName, usageContext, codeSnippets } = await request.json()

    if (!functionName || !usageContext) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check cache
    const cacheKey = generateCacheKey('function_usage', functionName, usageContext)
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
            content: 'You are a code analysis expert. Explain where and why functions are used.',
          },
          {
            role: 'user',
            content: `Analyze WHERE and WHY this function is used:\n\nFunction: ${functionName}\n\nUsage Context:\n${usageContext}\n\nCode Snippets:\n${codeSnippets || 'No snippets provided'}\n\nExplain the purpose and context of usage.`,
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
      where: explanation,
      timestamp: Date.now(),
    }

    // Cache the result
    cacheManager.set(cacheKey, result)

    return NextResponse.json({
      ...result,
      cached: false,
    })
  } catch (error) {
    console.error('Usage explanation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate usage explanation' },
      { status: 500 }
    )
  }
}
