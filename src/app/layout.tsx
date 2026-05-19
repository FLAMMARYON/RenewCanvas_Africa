import type { Metadata } from "next";
import "./globals.css";
import GoogleTranslate from "@/components/GoogleTranslate";

export const metadata: Metadata = {
  title: "RenewCanvas Africa",
  description:
    "Turning waste into art, and art into impact through circular African creativity.",
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
    "circular art",
    "waste to art",
  ],
  authors: [{ name: "RenewCanvas Africa" }],
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "RenewCanvas Africa",
    description: "Turning waste into art, and art into impact.",
    type: "website",
    locale: "en_US",
    siteName: "RenewCanvas Africa",
    images: ["/brand/linkedin-banner.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "RenewCanvas Africa",
    description: "Turning waste into art, and art into impact.",
    images: ["/brand/linkedin-banner.png"],
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
