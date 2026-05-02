import type { Metadata } from "next";
import "./globals.css";

const KOS_NAME = process.env.NEXT_PUBLIC_KOS_NAME ?? "Info Kos";

export const metadata: Metadata = {
  title: KOS_NAME,
  description: `Informasi kamar dan ketersediaan ${KOS_NAME}`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
