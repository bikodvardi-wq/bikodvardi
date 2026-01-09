import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "biKodVardı | Aradığın kod, tek tıkla.",
  description: "En güncel indirim kodları ve fırsatlar.",
  manifest: "/manifest.json", // Mobil uygulama özelliği için
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "biKodVardı",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}                   