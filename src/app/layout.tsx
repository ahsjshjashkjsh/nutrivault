import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NutriVault — Track. Fuel. Thrive.",
    template: "%s | NutriVault",
  },
  description:
    "The free nutrition and calorie tracker that helps you reach your health goals with precision, clarity, and consistency.",
  keywords: ["nutrition tracker", "calorie counter", "macro tracking", "diet app", "fitness"],
  authors: [{ name: "NutriVault" }],
  creator: "NutriVault",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "NutriVault — Track. Fuel. Thrive.",
    description: "Free nutrition and calorie tracking for serious results.",
    siteName: "NutriVault",
  },
  twitter: {
    card: "summary_large_image",
    title: "NutriVault",
    description: "Free nutrition and calorie tracking for serious results.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('nutrivault-theme');document.documentElement.classList.add(t==='light'?'light':'dark');}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
