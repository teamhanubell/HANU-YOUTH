import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import './globals.css'
import { ReactNode } from 'react'
import { ThemeProvider } from '@/components/Theme/ThemeProvider'
import { ChatConnectionsProvider } from '@/components/Chat/ConnectionsProvider'

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HANU-YOUTH Platform - AI-Powered Global Youth Empowerment",
  description: "Advanced AI platform empowering global youth through knowledge, innovation, and community unification. Built with Next.js, TypeScript, and cyberpunk design.",
  keywords: ["HANU-YOUTH", "Next.js", "TypeScript", "AI", "UNESCO", "Youth Empowerment", "Global Innovation"],
  authors: [{ name: "HANU-YOUTH Team" }],
  openGraph: {
    title: "HANU-YOUTH Platform",
    description: "AI-powered global youth empowerment platform",
    url: "https://hanu-youth.org",
    siteName: "HANU-YOUTH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HANU-YOUTH Platform",
    description: "AI-powered global youth empowerment platform",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <ThemeProvider>
          <ChatConnectionsProvider>
            {children}
          </ChatConnectionsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
