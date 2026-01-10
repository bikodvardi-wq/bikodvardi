/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TypeScript hataları olsa bile derlemeye devam et
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint hatalarını derleme sırasında görmezden gel
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;