import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cwoswinjuiwcylcsufav.supabase.co', // BURAYA KENDİ SUPABASE ADRESİNİ YAZMAYI UNUTMA! (Örn: xxyyzz.supabase.co)
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;