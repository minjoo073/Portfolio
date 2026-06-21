'use client'

import { useEffect, useRef } from 'react'
import type { ContentGroup } from '@/lib/types/content'
import { AppLaunchPreview } from './previews/AppLaunchPreview'
import { PromotionVideoPreview } from './previews/PromotionVideoPreview'
import { PersonalVideoPreview } from './previews/PersonalVideoPreview'

interface Props {
  group: ContentGroup
}

/**
 * 호버/스크롤된 그룹의 미디어 타입에 따라 preview 렌더.
 *
 * Scroll 동작:
 *  - 콘텐츠가 viewport 안 fit → 모든 wheel = 페이지 scroll (그룹 자동 전환)
 *  - 콘텐츠 길음 + 안에서 스크롤 → 자체 scroll (data-lenis-prevent 활성)
 *  - 자체 scroll 맨 위 도달 + 위로 wheel → 페이지 scroll (이전 그룹)
 *  - 자체 scroll 맨 아래 도달 + 아래로 wheel → 페이지 scroll (다음 그룹)
 */
export function PreviewArea({ group }: Props) {
  const { media } = group
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const updateLenisPrevent = (deltaY = 0) => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const hasOverflow = scrollHeight > clientHeight + 1
      const atTop = scrollTop <= 0
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1

      // 콘텐츠 overflow X = 페이지 scroll 으로
      if (!hasOverflow) {
        el.removeAttribute('data-lenis-prevent')
        return
      }
      // 맨 위 + 위로 스크롤 = 페이지로 전달 (이전 그룹)
      if (deltaY < 0 && atTop) {
        el.removeAttribute('data-lenis-prevent')
        return
      }
      // 맨 아래 + 아래로 스크롤 = 페이지로 전달 (다음 그룹)
      if (deltaY > 0 && atBottom) {
        el.removeAttribute('data-lenis-prevent')
        return
      }
      // 그 외 = 자체 scroll 유지
      el.setAttribute('data-lenis-prevent', '')
    }

    // 그룹 변경 시 = 맨 위로 reset
    el.scrollTop = 0
    updateLenisPrevent(0)

    const handleWheel = (e: WheelEvent) => {
      updateLenisPrevent(e.deltaY)
    }
    const handleScroll = () => updateLenisPrevent(0)

    el.addEventListener('wheel', handleWheel, { passive: true })
    el.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      el.removeEventListener('wheel', handleWheel)
      el.removeEventListener('scroll', handleScroll)
    }
  }, [group.id])

  return (
    <div
      ref={ref}
      className="h-[85vh] w-full overflow-y-auto overscroll-contain no-scrollbar"
      data-preview-area
      data-active-group={group.id}
    >
      {media.type === 'app-launch' && <AppLaunchPreview apps={media.apps} />}
      {media.type === 'promotion-video' && <PromotionVideoPreview {...media} />}
      {media.type === 'personal-video' && <PersonalVideoPreview {...media} />}
    </div>
  )
}

