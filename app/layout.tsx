import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';


const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={cn(inter.variable, fontMono.variable, 'font-sans antialiased')}>
        <ThemeProvider>
        {children}
        {process.env.NODE_ENV === 'production'}
        </ThemeProvider>
      </body>
    </html>
  )
}
