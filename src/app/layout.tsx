import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'  // Add this import

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Perp Dashboard',
  description: 'Perp DEX Vault Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>  {/* Wrap {children} here */}
      </body>
    </html>
  )
}