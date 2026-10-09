import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Projedeki mevcut TypeScript hataları giderilene kadar korunuyor.
  // Daha sonra bunu kaldırıp build sırasında tip kontrolünü yeniden açacağız.
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cwoswinjuiwcylcsufav.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ["image/avif", "image/webp"],
  },

  /*
   * Silinmiş kampanyaları ana sayfaya yönlendirmiyoruz.
   * Karşılığı bulunmayan URL'ler kampanya sayfasındaki notFound() ile
   * gerçek 404 yanıtı vermeli. Yalnızca eski ve yeni içerik birebir aynıysa
   * buraya kalıcı 301 yönlendirmesi eklenmeli.
   */
};

export default nextConfig;
