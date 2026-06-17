import type { Metadata } from 'next'
import { inter, display, pretendard, mono } from './fonts'
import { ReducedMotionProvider } from '@/components/global/ReducedMotionProvider'
import { SmoothScrollProvider } from '@/components/global/SmoothScrollProvider'
import { Navigation } from '@/components/global/Navigation'
import { SvgFilters } from '@/components/global/SvgFilters'
import './globals.css'

export const metadata: Metadata = {
  title: 'Park Minjoo — UX/UI Designer Portfolio',
  description:
    'UX/UI Designer · Web Publisher · Park Minjoo의 작업물을 모은 인터랙티브 포트폴리오.',
  metadataBase: new URL('https://parkminjoo.com'),
  openGraph: {
    title: 'Park Minjoo — UX/UI Designer Portfolio',
    description: 'UX/UI Designer Portfolio',
    type: 'website'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} ${display.variable} ${pretendard.variable} ${mono.variable}`}
    >
      <body className="bg-canvas text-ink-primary font-sans antialiased">
        <ReducedMotionProvider>
          <SmoothScrollProvider>
            <SvgFilters />
            <Navigation />
            {/* CustomCursor 제거(CEO 2026-06-17) — lerp 지연 체감 개선. 복구하려면 재마운트. */}
            <main>{children}</main>
          </SmoothScrollProvider>
        </ReducedMotionProvider>
      </body>
    </html>
  )
}
