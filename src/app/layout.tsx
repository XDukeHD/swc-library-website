import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SWC Library - Nintendo Switch ROMs (NSP & XCI)",
    template: "%s | SWC Library",
  },
  description: "Download safe, fast, and verified Nintendo Switch backup ROMs. Browse the latest NSP and XCI games, updates, and DLCs for your emulation or modded console.",
  keywords: [
    "Nintendo Switch ROMs",
    "Switch backups",
    "NSP downloads",
    "XCI files",
    "Switch emulation",
    "Yuzu ROMs",
    "Ryujinx backups",
    "Switch modding",
    "SWC Library"
  ],
  authors: [
    {
      name: "xDuke",
    }
  ],
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
  openGraph: {
    type: "website",
    locale: "en_BR",
    url: "https://swclibrary.online",
    title: "SWC Library - Nintendo Switch ROMs (NSP & XCI)",
    description: "Your safe haven for Nintendo Switch backup ROMs. Download verified NSP/XCI games, updates, and DLCs with an active community.",
    siteName: "SWC Library",
    images: [
      {
        url: "https://swclibrary.online/assets/img/swclibraryog.png",
        width: 1200,
        height: 630,
        alt: "SWC Library - Nintendo Switch Backups",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SWC Library - Nintendo Switch ROMs",
    description: "Download verified NSP and XCI backups for Nintendo Switch. Safe links, updates, and DLCs.",
    images: ["https://swclibrary.online/assets/img/swclibraryog.png"],
  },

  alternates: {
    canonical: "https://swclibrary.online",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-dark text-text-primary">
        <Navbar />

        <main className="flex flex-col flex-1">
          {children}
          <Analytics />
          <SpeedInsights />
        </main>
        <Footer />
      </body>
    </html>
  );
}

