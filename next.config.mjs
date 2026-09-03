/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
