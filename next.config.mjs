/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1536, 1920]
  },
  experimental: {
    optimizePackageImports: ['gsap']
  }
}

export default nextConfig
