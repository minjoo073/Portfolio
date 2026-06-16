import { Inter, IBM_Plex_Mono } from 'next/font/google'
import localFont from 'next/font/local'

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

/**
 * Mono 폰트 — IBM Plex Mono (Google Fonts, OFL 무료).
 * Editorial mono 정석. 매거진 차례 페이지 메타포에 가장 적합.
 * Cross-platform 통일 (Win/Mac 동일 렌더).
 *
 * 사용처: 메타·라벨·액션 (date · category · workType · 인덱스, View Site/Case, INDEX, TURN PAGE 등).
 */
export const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

/**
 * Display 폰트 — PP Editorial New (Pangram Pangram).
 * Editorial display serif. quiet luxury + 매거진 톤.
 * 무료 personal use 라이선스.
 *
 * weights:
 *   200 Ultralight (+ italic)
 *   400 Regular    (+ italic)
 *   800 Ultrabold  (+ italic)
 *
 * 한글: 자체 지원 X → tailwind fontFamily 폴백으로 Pretendard 적용.
 */
export const display = localFont({
  src: [
    {
      path: '../public/fonts/PPEditorialNew-Ultralight.otf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../public/fonts/PPEditorialNew-UltralightItalic.otf',
      weight: '200',
      style: 'italic',
    },
    {
      path: '../public/fonts/PPEditorialNew-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/PPEditorialNew-Italic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../public/fonts/PPEditorialNew-Ultrabold.otf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../public/fonts/PPEditorialNew-UltraboldItalic.otf',
      weight: '800',
      style: 'italic',
    },
  ],
  variable: '--font-display',
  display: 'swap',
})

export const pretendard = localFont({
  src: '../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
  weight: '45 920'
})
