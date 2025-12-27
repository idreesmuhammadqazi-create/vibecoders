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

    // Get repository tree
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    )

    if (!response.ok) {
      // Try master branch if main doesn't exist
      const masterResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      )

      if (!masterResponse.ok) {
        throw new Error('Failed to fetch repository tree')
      }

      const tree = await masterResponse.json()
      return NextResponse.json(tree.tree)
    }

    const tree = await response.json()
    return NextResponse.json(tree.tree)
  } catch (error) {
    console.error('Files fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repository files' },
      { status: 500 }
    )
  }
}
