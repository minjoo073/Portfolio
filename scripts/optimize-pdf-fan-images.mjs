// PDF-fan 덱 전용 raster 사전 최적화.
// 목적: Preview.app 의 ICC 컬러 매핑 부담 제거 + 정확한 표시 크기.
// Sharp 로 원본 → 1536폭 sRGB JPEG q=85 변환해 public/portfolio-src/ 에 저장.
// pdf-fan/page.tsx 에서 이 파일을 _next/image 우회하고 직접 참조.

import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const OUT_DIR = resolve('public/portfolio-src')

const targets = [
  { src: 'public/images/projects/08/thumbnail.webp', out: 'pdf-fan-cover.jpg', width: 1800, quality: 92 },
  { src: 'public/projects/kiikii/study/making/gallery.jpg', out: 'pdf-fan-gallery.jpg', width: 1800, quality: 92 },
]

const run = async () => {
  await mkdir(OUT_DIR, { recursive: true })
  for (const t of targets) {
    const outPath = resolve(OUT_DIR, t.out)
    const info = await sharp(t.src)
      .resize({ width: t.width, withoutEnlargement: true })
      .toColorspace('srgb')
      .jpeg({ quality: t.quality, progressive: true, mozjpeg: true })
      .toFile(outPath)
    console.log(`✓ ${t.out} — ${t.width}px sRGB JPEG q=${t.quality} · ${(info.size / 1024).toFixed(0)}KB`)
  }
}

run().catch((e) => {
  console.error('✗ 실패:', e.message)
  process.exit(1)
})
