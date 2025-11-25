import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { UpgradeModalProvider } from "@/components/tier/UpgradeModalProvider";
import { DevTools } from "@/components/dev/DevTools";
import { ToastProvider } from "@/contexts/ToastContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Harmonic Wave Studio",
  description: "Interactive Fourier series and harmonic wave visualization",
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
            </UpgradeModalProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
