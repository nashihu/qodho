/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'dist',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.suara.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn1-production-images-kly.akamaized.net',
      },
    ],
  },
};

export default nextConfig;
