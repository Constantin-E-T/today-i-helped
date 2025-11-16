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
  title: {
    default: "Today I Helped",
    template: "%s | Today I Helped",
  },
  description:
    "Track your daily acts of kindness and make the world a better place, one help at a time.",
  keywords: [
    "kindness",
    "helping",
    "daily challenge",
    "good deeds",
    "community",
  ],
  authors: [{ name: "Today I Helped Team" }],
  creator: "Today I Helped",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://todayihelped.com",
    title: "Today I Helped",
    description:
      "Track your daily acts of kindness and make the world a better place, one help at a time.",
    siteName: "Today I Helped",
  },
  twitter: {
    card: "summary_large_image",
    title: "Today I Helped",
    description:
      "Track your daily acts of kindness and make the world a better place, one help at a time.",
  },
  icons: {
    icon: "/favicon.ico",
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
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
