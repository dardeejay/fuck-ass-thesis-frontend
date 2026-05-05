import { getServerAuthSession } from '@/auth'
import { AuthSessionProvider } from '@/components/auth/session-provider'
import { ThemeProvider } from '@/components/theme-provider'
import '@/lib/env'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { Geist_Mono, Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Project Handa - AI Decision Support System',
  description: 'Hazard Assessment for Notification and Decision Automation - AI Based Decision Support System for Class Suspension',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerAuthSession()

  return (
    <html lang="en" className="bg-background">
      <body className={cn(inter.variable, fontMono.variable, 'font-sans antialiased')}>
        <AuthSessionProvider session={session}>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
