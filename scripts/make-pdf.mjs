// 포트폴리오 PDF 생성 — /pdf(전체) 또는 /pdf-fan(팬마케팅) 라우트를 헤드리스 크롬으로 인쇄.
//
// 사용법:
//   1) 다른 터미널에서  npm run dev   (localhost:3000 실행)
//   2) 전체 덱:        npm run pdf
//      팬마케팅 덱:     npm run pdf:fan     (= node scripts/make-pdf.mjs fan)
//
// 결과물:
//   public/portfolio/park-minjoo-portfolio.pdf       (전체)
//   public/portfolio/park-minjoo-portfolio-fan.pdf   (팬마케팅)
//   - 벡터 텍스트 + 선택/복사 가능 + 제작과정/실사이트 링크 클릭 동작
//
// 환경변수(선택)로도 덮어쓰기 가능: PDF_URL / PDF_OUT

import { chromium } from 'playwright'
import { mkdir, stat, rename, unlink } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { spawn } from 'node:child_process'

// 첫 CLI 인자 'fan' 이면 팬마케팅 덱, 아니면 전체 덱
const variant = process.argv[2] === 'fan' ? 'fan' : 'full'
const DEFAULT_URL = variant === 'fan' ? 'http://localhost:3000/pdf-fan/' : 'http://localhost:3000/pdf/'
const DEFAULT_OUT = variant === 'fan'
  ? 'public/portfolio/park-minjoo-portfolio-fan.pdf'
  : 'public/portfolio/park-minjoo-portfolio.pdf'

const URL = process.env.PDF_URL || DEFAULT_URL
const OUT = resolve(process.env.PDF_OUT || DEFAULT_OUT)

const run = async () => {
  await mkdir(dirname(OUT), { recursive: true })

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 900, height: 1273 } })

  console.log('→ open', URL)
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 })

  // 웹폰트 로딩 완료까지 대기 (PP Editorial / Pretendard / IBM Plex Mono)
  await page.evaluate(() => document.fonts.ready)
  // 배경이미지(thumbnail) 최적화·디코드 여유 (_next/image 첫 요청 포함)
  await page.waitForTimeout(3000)

  // 슬라이드 크기는 /pdf 의 CSS @page (1280×720, 16:9) 가 결정
  await page.pdf({
    path: OUT,
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
  })

  await browser.close()
  const rawSize = (await stat(OUT)).size
  console.log('✓ PDF 생성 완료:', OUT, `(${(rawSize / 1024 / 1024).toFixed(1)}MB)`)

  // Ghostscript 후처리 — 환경변수 GS_COMPRESS=1 로만 발동.
  // Preview.app 에서 특정 raster(webp 유래) 표시 실패 사례 있어 기본 OFF.
  if (process.env.GS_COMPRESS === '1') {
    await compressWithGhostscript(OUT)
  }
}

const compressWithGhostscript = async (path) => {
  // 목표: raster 는 원본 그대로 통과, ICC 프로파일만 sRGB 로 통일.
  // Preview.app 이 페이지 전환마다 ICC 컬러 매핑을 재수행하는 부담을 제거.
  const tmp = path.replace(/\.pdf$/, '.gs.pdf')
  await new Promise((res, rej) => {
    const gs = spawn('gs', [
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.6',
      '-dNOPAUSE', '-dQUIET', '-dBATCH',
      // ICC → sRGB 통일
      '-dColorConversionStrategy=/sRGB',
      '-dConvertCMYKImagesToRGB=true',
      '-sProcessColorModel=DeviceRGB',
      // JPEG 원본 그대로 통과 — 재인코딩·다운샘플링 방지
      '-dPassThroughJPEGImages=true',
      '-dDownsampleColorImages=false',
      '-dDownsampleGrayImages=false',
      '-dAutoFilterColorImages=false',
      '-dEncodeColorImages=true',
      '-dColorImageFilter=/DCTEncode',
      // 중복 이미지 감지 + 폰트 압축
      '-dDetectDuplicateImages=true',
      '-dCompressFonts=true',
      `-sOutputFile=${tmp}`,
      path,
    ])
    gs.on('error', rej)
    gs.on('exit', (code) => code === 0 ? res() : rej(new Error(`gs exit ${code}`)))
  })
  const newSize = (await stat(tmp)).size
  await unlink(path)
  await rename(tmp, path)
  console.log('✓ Ghostscript 후처리 완료:', path, `(${(newSize / 1024 / 1024).toFixed(1)}MB)`)
}

run().catch((e) => {
  console.error('✗ PDF 생성 실패:', e.message)
  process.exit(1)
})
