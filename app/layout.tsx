import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/lib/auth"
import { FeedbackProvider } from "@/lib/feedback"
import "./globals.css"

export const metadata: Metadata = {
  title: "TechInterview - Plataforma de Treinamento para Entrevistas Técnicas",
  description: "Treine para entrevistas técnicas com questões reais de empresas como Itaú, Meta, X (Twitter) e outras.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <AuthProvider>
          <FeedbackProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </FeedbackProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
