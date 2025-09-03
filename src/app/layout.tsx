import './globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'OnePage SaaS',
  description: 'Minimal one-page SaaS with periodic LLM refresh',
  manifest: '/manifest.webmanifest',
  themeColor: '#111111',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <script dangerouslySetInnerHTML={{__html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').catch(() => {})
            })
          }
        `}} />
        <div className="mx-auto max-w-3xl p-4">{children}</div>
      </body>
    </html>
  )
}
