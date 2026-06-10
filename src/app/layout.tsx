import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
  weight: ["600", "700", "800"],
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700", "800", "900"],
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
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NutriVault",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunito.variable} ${baloo.variable} light`} suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('nutrivault-theme');var r=t==='dark'?'dark':'light';document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(r);document.documentElement.style.colorScheme=r;}catch(e){document.documentElement.classList.add('light');document.documentElement.style.colorScheme='light';}})();`,
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
