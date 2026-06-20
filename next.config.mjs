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
  // Windows 핫리로드 시 .next/cache/webpack 의 .pack.gz rename 실패로 캐시가 깨져
  // (JSON 매니페스트 파싱 에러 → 500 / CSS 미적용) 반복 발생 → dev 에선 메모리 캐시로 회피.
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: 'memory' }
    }
    return config
  },
  // 정적 케이스스터디(public/projects/<slug>/study/index.html)를 폴더 URL로 서빙.
  // Next는 public/ 디렉터리 index 자동매핑을 안 하므로 명시 rewrite.
  // 트레일링 슬래시 유지 — LUNARE/바닐라가 ./assets 상대경로라 슬래시 필수.
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/projects/:slug/study', destination: '/projects/:slug/study/index.html' },
        { source: '/projects/:slug/study/', destination: '/projects/:slug/study/index.html' },
        // LUNARE_ Vite 빌드가 base: '/LUNARE_/' 라 asset path 가 /LUNARE_/* 로 빠짐 → 실제 위치로 매핑
        { source: '/LUNARE_/:path*', destination: '/projects/lunare/study/:path*' }
      ]
    }
  }
}

export default nextConfig
