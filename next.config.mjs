/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // study 정적페이지가 ./assets 상대경로라 URL 끝 슬래시가 보존돼야 함
  trailingSlash: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1536, 1920]
  },
  experimental: {
    optimizePackageImports: ['gsap']
  },
  // 정적 케이스스터디(public/projects/<slug>/study/index.html)를 폴더 URL로 서빙.
  // Next는 public/ 디렉터리 index 자동매핑을 안 하므로 명시 rewrite.
  // 트레일링 슬래시 유지 — LUNARE/바닐라가 ./assets 상대경로라 슬래시 필수.
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/projects/:slug/study', destination: '/projects/:slug/study/index.html' },
        { source: '/projects/:slug/study/', destination: '/projects/:slug/study/index.html' }
      ]
    }
  }
}

export default nextConfig
