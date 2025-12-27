import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VibeCoders - Understand Your Code',
  description: 'Explore functions, dependencies, and features in your GitHub repositories',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-dark text-light">{children}</body>
    </html>
  )
}
