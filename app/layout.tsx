import { GoogleAnalytics } from '@next/third-parties/google'  
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Script from "next/script"; // AdSense için gerekli

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
  icons: {
    icon: "/icon.png", // Tarayıcı sekmesi için
    apple: "/apple-icon.png", // iPhone/iPad için
  }, 
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "biKodVardı",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        {/* GOOGLE ADSENSE KODU BAŞLANGIÇ */}
        {/* ca-pub-XXXXXXXXXXXXXXXX kısmını AdSense panelindeki kendi numaranla değiştir */}
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9467886699019448"
          crossOrigin="anonymous"
        />
        {/* GOOGLE ADSENSE KODU BİTİŞ */}
      </head>
      <body>
        {children}
        {/* Google Analytics Buraya Eklendi */}
        <GoogleAnalytics gaId="G-0N4WX0JBNB" /> 
      </body>
    </html>
  );
}