import type { Metadata } from "next";
import "./globals.css";
import GoogleTranslate from "@/components/GoogleTranslate";

export const metadata: Metadata = {
  title: "RenewCanvas Africa | Circular Art Platform",
  description:
    "Transforming plastic waste into sustainable creative value across Africa. Buy unique upcycled artwork with verified environmental impact.",
  keywords: [
    "upcycled art",
    "sustainable art",
    "African art",
    "circular economy",
    "recycled materials",
    "eco-friendly art",
    "plastic waste art",
    "Rwanda art",
    "Africa art marketplace",
  ],
  authors: [{ name: "RenewCanvas Africa" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml", sizes: "360x80" },
      { url: "/icon-300.svg", type: "image/svg+xml", sizes: "300x300" },
      { url: "/icon-mark-300.svg", type: "image/svg+xml", sizes: "300x300" },
    ],
    apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "RenewCanvas Africa | Circular Art Platform",
    description:
      "Transforming plastic waste into sustainable creative value across Africa.",
    type: "website",
    locale: "en_US",
    siteName: "RenewCanvas Africa",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <GoogleTranslate />
      </body>
    </html>
  );
}
