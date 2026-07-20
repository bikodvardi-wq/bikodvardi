import { GoogleAnalytics } from '@next/third-parties/google'  
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Script from "next/script";
import { AppBackButton } from "./AppBackButton"; // "./components/" kısmını sildik

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://bikodvardi.com'),
  alternates: {
    canonical: 'https://bikodvardi.com',
  },
  title: {
    default: "biKodVardı | En Güncel İndirim Kodları ve Kampanyalar",
    template: "%s | biKodVardı"
  },
  description: "2026'nın en güncel banka kampanyaları, indirim kodları ve marka fırsatları. Akbank, Ziraat, İş Bankası ve yüzlerce markanın kodları tek tıkla elinizde.",
  keywords: ["indirim kodu", "kampanyalar", "banka kampanyaları", "indirim kuponu", "güncel fırsatlar", "bi kod vardı"],
  authors: [{ name: "biKodVardı" }],
  creator: "biKodVardı",
  publisher: "biKodVardı",
  manifest: "/manifest.json", 
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://bikodvardi.com",
    siteName: "biKodVardı",
    title: "biKodVardı | Aradığın kod, tek tıkla.",
    description: "Yüzlerce markanın en güncel indirim ve kampanya kodları.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "biKodVardı | İndirim Kodları",
    description: "Aradığın indirim kodu tek tıkla cebinde!",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;600;900&family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9467886699019448"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <AppBackButton /> {/* Android Geri Tuşu Burada Sessizce Çalışacak */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "biKodVardı",
              "url": "https://bikodvardi.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://bikodvardi.com/?ara={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        {children}
        <GoogleAnalytics gaId="G-0N4WX0JBNB" /> 
      </body>
    </html>
  );
}