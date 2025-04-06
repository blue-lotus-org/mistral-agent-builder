import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mistalic - AI Agent Code Creator",
  description: "Create and edit AI agents using Mistral models",
    generator: 'lotuschain.org'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              try {
                const savedTheme = localStorage.getItem("mistalic-theme");
                if (savedTheme) {
                  const theme = JSON.parse(savedTheme);
                  document.documentElement.setAttribute('data-theme', theme.name);
                  document.documentElement.style.setProperty('--accent-color', theme.accentColor);
                }
              } catch (e) {
                console.error("Error applying theme:", e);
              }
            })();
          `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-[#1e1e1e] text-gray-300 antialiased dark-theme`}>{children}</body>
    </html>
  )
}



import './globals.css'