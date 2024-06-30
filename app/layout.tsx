import type { Metadata } from "next";
import type { Viewport } from 'next'
import { GeistSans } from 'geist/font/sans';
import "@styles/globals.scss";

export const metadata: Metadata = {
  title: "Cyberfeminism",
  description: "A digital intervention",
  icons: {
    icon: [
      { rel: "icon", url: "/favicon.ico" },
      { rel: "icon", type: "image/png", sizes: "32x32", url: "/icons/favicons/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", url: "/icons/favicons/favicon-16x16.png" },
    ],
    apple: [
      { rel: "apple-touch-icon", sizes: "180x180", url: "/icons/favicons/apple-touch-icon.png" }
    ],
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f8f8' },
    { media: '(prefers-color-scheme: dark)', color: '#e0e0e0' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <html lang="en" className={GeistSans.variable}>
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/str2hdb.css"/>
      </head>
      <body>{children}</body>
      </html>
  )
}
