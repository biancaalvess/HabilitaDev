import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { AuthProvider } from "@/lib/auth";
import { ErrorBoundary } from "@/lib/error-boundary";
import { NotificationContainer } from "@/components/ui/notification-container";
import { RadioGlobalMount } from "@/components/radio-global-mount";
import "./globals.css";

export const metadata: Metadata = {
  title: "HabilitaDev - Plataforma de Treinamento para Entrevistas Técnicas",
  description:
    "Treine para entrevistas técnicas com questões reais de empresas como Itaú, Meta, X (Twitter) e outras.",
  generator: "v0.app",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className="dark"
      translate="yes"
      suppressHydrationWarning
    >
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <AuthProvider>
            <Suspense fallback={null}>{children}</Suspense>
            <RadioGlobalMount />
            <NotificationContainer />
          </AuthProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
