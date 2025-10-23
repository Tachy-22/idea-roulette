import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IdeaRoulette - Swipe Startup Ideas Like TikToks",
  description: "Discover endless startup ideas through an engaging TikTok-style interface powered by AI. Find your next big business idea with personalized recommendations.",
  openGraph: {
    title: "IdeaRoulette - Swipe Startup Ideas Like TikToks",
    description: "Discover endless startup ideas through an engaging TikTok-style interface powered by AI. Find your next big business idea with personalized recommendations.",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IdeaRoulette - Swipe Startup Ideas Like TikToks",
    description: "Discover endless startup ideas through an engaging TikTok-style interface powered by AI. Find your next big business idea with personalized recommendations.",
    images: ["/og-image.png"],
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
        {children}
      </body>
    </html>
  );
}
