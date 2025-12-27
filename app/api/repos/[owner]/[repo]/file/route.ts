import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  const token = request.cookies.get('github_token')?.value

  if (!token) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  try {
    const { owner, repo } = params
    const path = request.nextUrl.searchParams.get('path')

    console.log('File fetch request:', { owner, repo, path })

    if (!path) {
      return NextResponse.json(
        { error: 'Missing path parameter' },
        { status: 400 }
      )
    }

    // Get file content from GitHub
    const githubUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
    console.log('GitHub URL:', githubUrl)

    const response = await fetch(githubUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3.raw',
      },
    })

    console.log('GitHub response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('GitHub error:', errorText)
      throw new Error(`Failed to fetch file: ${response.statusText}`)
    }

    const content = await response.text()
    console.log('File content length:', content.length)
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  } catch (error) {
    console.error('File fetch error:', error)
    return NextResponse.json(
      { error: `Failed to fetch file: ${error}` },
      { status: 500 }
    )
  }
}
