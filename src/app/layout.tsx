import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { UpgradeModalProvider } from "@/components/tier/UpgradeModalProvider";
import { DevTools } from "@/components/dev/DevTools";
import { ToastProvider } from "@/contexts/ToastContext";
import { Analytics } from "@vercel/analytics/react";

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
    default: "Harmonic Wave Studio | Interactive Fourier Series Visualization",
    template: "%s | Harmonic Wave Studio",
  },
  description:
    "Create stunning Fourier series animations with epicycles. Interactive web-based tool for visualizing harmonic waves, complex waveforms, and signal processing. Perfect for education and research.",
  keywords: [
    "fourier series",
    "epicycles",
    "wave visualization",
    "harmonic analysis",
    "signal processing",
    "waveform generator",
    "interactive animation",
    "mathematics visualization",
    "complex numbers",
    "frequency analysis",
  ],
  authors: [{ name: "Harmonic Wave Studio" }],
  creator: "Harmonic Wave Studio",
  publisher: "Harmonic Wave Studio",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://harmonic-wave-studio.vercel.app",
    title: "Harmonic Wave Studio | Interactive Fourier Series Visualization",
    description:
      "Create stunning Fourier series animations with epicycles. Interactive web-based tool for visualizing harmonic waves and signal processing.",
    siteName: "Harmonic Wave Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Harmonic Wave Studio | Interactive Fourier Series Visualization",
    description:
      "Create stunning Fourier series animations with epicycles. Interactive web-based tool for visualizing harmonic waves and signal processing.",
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
  verification: {
    google: "google-site-verification-code", // Replace with actual verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ToastProvider>
            <UpgradeModalProvider>
              <DevTools />
              {children}
              <Analytics />
            </UpgradeModalProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
