import type React from "react"
// ============================================
// LAYOUT PRINCIPAL DE L'APPLICATION
// ============================================

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

// Police Google Fonts
const inter = Inter({ subsets: ["latin"] })

// Métadonnées de l'application
export const metadata: Metadata = {
  title: "Guerite AI - Gestion autonome des visiteurs",
  description: "Système intelligent de gestion de guérite avec scan automatique de CNI et détection de doublons",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
