// 포트폴리오 PDF 생성 — /pdf 라우트를 헤드리스 크롬으로 인쇄.
//
// 사용법:
//   1) 다른 터미널에서  npm run dev   (localhost:3000 실행)
//   2)                 npm run pdf
//
// 결과물: public/portfolio/park-minjoo-portfolio.pdf
//   - 벡터 텍스트 + 선택/복사 가능 + "제작과정/실사이트" 링크 클릭 동작
//
// 환경변수:
//   PDF_URL   대상 URL (기본 http://localhost:3000/pdf)
//   PDF_OUT   출력 경로 (기본 public/portfolio/park-minjoo-portfolio.pdf)

import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const URL = process.env.PDF_URL || 'http://localhost:3000/pdf/'
const OUT = resolve(process.env.PDF_OUT || 'public/portfolio/park-minjoo-portfolio.pdf')

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
  console.log('✓ PDF 생성 완료:', OUT)
}

run().catch((e) => {
  console.error('✗ PDF 생성 실패:', e.message)
  process.exit(1)
})
