import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
          {children}
        </div>
      </body>
    </html>
  )
}
