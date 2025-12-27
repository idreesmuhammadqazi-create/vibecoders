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

    // Determine which API to use
    const apiKey = process.env.ROUTEWAY_API_KEY || process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      throw new Error('No API key configured (ROUTEWAY_API_KEY or OPENAI_API_KEY)')
    }

    let explanation = ''

    // Try Routeway.ai first if key is available
    if (process.env.ROUTEWAY_API_KEY) {
      console.log('Using Routeway.ai API')
      try {
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

        console.log('Routeway.ai response status:', routewayResponse.status)

        if (routewayResponse.ok) {
          const routewayData = await routewayResponse.json()
          if (routewayData.choices && routewayData.choices[0]) {
            explanation = routewayData.choices[0].message.content
          }
        } else {
          const errorText = await routewayResponse.text()
          console.error('Routeway.ai error:', errorText)
        }
      } catch (error) {
        console.error('Routeway.ai fetch error:', error)
      }
    }

    // Fallback to OpenAI if Routeway.ai failed or not configured
    if (!explanation && process.env.OPENAI_API_KEY) {
      console.log('Using OpenAI API')
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

      console.log('OpenAI response status:', openaiResponse.status)

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text()
        console.error('OpenAI error:', errorText)
        throw new Error(`OpenAI API error (${openaiResponse.status}): ${errorText.substring(0, 200)}`)
      }

      const openaiData = await openaiResponse.json()
      if (openaiData.choices && openaiData.choices[0]) {
        explanation = openaiData.choices[0].message.content
      } else {
        throw new Error('Invalid response from OpenAI: no choices')
      }
    }

    if (!explanation) {
      throw new Error('Failed to get explanation from any API')
    }

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
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Explanation error:', errorMessage)
    return NextResponse.json(
      { error: `Failed to generate explanation: ${errorMessage}` },
      { status: 500 }
    )
  }
}
