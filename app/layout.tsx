import { GoogleAnalytics } from '@next/third-parties/google'  
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
  manifest: "/manifest.json", 
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "biKodVardı",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        {children}
        {/* Google Analytics Buraya Eklendi */}
        <GoogleAnalytics gaId="G-0N4WX0JBNB" /> 
      </body>
    </html>
  );
}
