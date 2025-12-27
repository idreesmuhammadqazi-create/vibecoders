import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json(
      { error: 'No authorization code provided' },
      { status: 400 }
    )
  }

  try {
    // Exchange code for access token
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.error('Missing GitHub credentials:', { clientId: !!clientId, clientSecret: !!clientSecret })
      return NextResponse.json(
        { error: 'Server configuration error: Missing GitHub credentials' },
        { status: 500 }
      )
    }

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error('GitHub token error:', tokenData)
      return NextResponse.json(
        { error: tokenData.error_description || 'Failed to get access token' },
        { status: 400 }
      )
    }

    const accessToken = tokenData.access_token

    // Create response with token in cookie
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.set('github_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error('GitHub auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
