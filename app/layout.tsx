import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Houston Talent Finder - Connect with Local Producers',
  description: 'Premier talent discovery platform connecting models and performers with Houston area producers.',
  keywords: 'Houston, talent, modeling, entertainment, producers, casting',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>
          <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
