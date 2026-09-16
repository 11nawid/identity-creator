import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { MobileBottomBar } from "@/components/mobile-bottom-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://identity-creator.vercel.app";
const SITE_NAME = "Identity Creator";
const SITE_DESCRIPTION =
  "Generate realistic synthetic identities for testing, prototyping, and development. Free, open-source, and works offline. Complete profiles with names, addresses, careers, financials, and more.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Synthetic Profile Generator for Testing & Development`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "identity generator",
    "synthetic data",
    "fake profile generator",
    "test data generator",
    "placeholder data",
    "user generator",
    "fake identity",
    "mock data",
    "development tools",
    "testing tools",
    "open source",
    "free tool",
  ],
  authors: [{ name: "11nawid" }],
  creator: "11nawid",
  publisher: "11nawid",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Generate Realistic Synthetic Identities for Testing`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Identity Creator — Synthetic Profile Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Synthetic Profile Generator`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@11nawid",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: SITE_NAME,
                description: SITE_DESCRIPTION,
                url: SITE_URL,
                applicationCategory: "DeveloperApplication",
                operatingSystem: "Web",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                },
                author: {
                  "@type": "Person",
                  name: "11nawid",
                  url: "https://github.com/11nawid",
                },
                features: [
                  "Offline-first synthetic identity generation",
                  "Optional AI enhancement via Gemini",
                  "Batch generation of 5-50 profiles",
                  "Temporary disposable email",
                  "Export to JSON, CSV, TXT, PDF",
                  "Dark and light theme",
                ],
              }),
            }}
          />
          {children}
          <MobileBottomBar />
        </Providers>
      </body>
    </html>
  );
}
