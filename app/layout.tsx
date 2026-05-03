import type { Metadata, Viewport } from "next";
import "./globals.css";

const KOS_NAME = process.env.NEXT_PUBLIC_KOS_NAME ?? "KosBoard";
const KOS_ADDRESS = process.env.NEXT_PUBLIC_KOS_ADDRESS ?? "Bandung";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kosanboard.vercel.app";

export const metadata: Metadata = {
  title: {
    default: KOS_NAME,
    template: `%s — ${KOS_NAME}`,
  },
  description: `Informasi kamar dan ketersediaan ${KOS_NAME} di ${KOS_ADDRESS}`,
  applicationName: "KosBoard",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KosBoard",
  },
  metadataBase: new URL(SITE_URL),
  openGraph: {
    siteName: KOS_NAME,
    locale: "id_ID",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#1e1b4b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}