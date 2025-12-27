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

    let explanation = ''
    let usedApi = ''

    // Try Routeway.ai first
    if (process.env.ROUTEWAY_API_KEY) {
      console.log('Trying Routeway.ai API...')
      try {
        const routewayResponse = await fetch('https://api.routeway.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ROUTEWAY_API_KEY}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          body: JSON.stringify({
            model: 'glm-4.6:free',
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

        if (routewayResponse.ok) {
          const responseData = await routewayResponse.json()
          if (responseData.choices && responseData.choices[0] && responseData.choices[0].message) {
            explanation = responseData.choices[0].message.content
            usedApi = 'routeway'
            console.log('Routeway.ai success')
          }
        } else {
          const contentType = routewayResponse.headers.get('content-type')
          if (contentType?.includes('application/json')) {
            const errorData = await routewayResponse.json()
            console.error('Routeway.ai JSON error:', errorData)
          } else {
            const text = await routewayResponse.text()
            console.error('Routeway.ai HTML error (likely Cloudflare):', text.substring(0, 100))
          }
        }
      } catch (error) {
        console.error('Routeway.ai fetch error:', error)
      }
    }

    // Fallback to OpenAI if Routeway.ai failed
    if (!explanation && process.env.OPENAI_API_KEY) {
      console.log('Falling back to OpenAI API...')
      try {
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

        console.log('OpenAI response status:', openaiResponse.status)

        if (openaiResponse.ok) {
          const responseData = await openaiResponse.json()
          if (responseData.choices && responseData.choices[0] && responseData.choices[0].message) {
            explanation = responseData.choices[0].message.content
            usedApi = 'openai'
            console.log('OpenAI success')
          }
        } else {
          const errorText = await openaiResponse.text()
          console.error('OpenAI error:', errorText.substring(0, 200))
        }
      } catch (error) {
        console.error('OpenAI fetch error:', error)
      }
    }

    // If still no explanation, return error
    if (!explanation) {
      return NextResponse.json(
        { error: 'Failed to get explanation from both Routeway.ai and OpenAI. Please check your API keys.' },
        { status: 500 }
      )
    }

    const result = {
      functionName,
      how: explanation,
      timestamp: Date.now(),
      usedApi,
    }

    // Cache the result
    cacheManager.set(cacheKey, result)

    console.log('Explanation generated successfully using:', usedApi)

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
