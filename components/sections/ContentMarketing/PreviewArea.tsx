'use client'

import type { ContentGroup } from '@/lib/types/content'
import { AppLaunchPreview } from './previews/AppLaunchPreview'
import { PromotionVideoPreview } from './previews/PromotionVideoPreview'
import { PersonalVideoPreview } from './previews/PersonalVideoPreview'

interface Props {
  group: ContentGroup
}

/**
 * 그룹 미디어 타입별 preview 렌더.
 *
 * 좌 고정 / 우 스크롤 구조로 전환되며 내부 overflow 스크롤·data-lenis-prevent 제거.
 * 우측 컬럼이 페이지와 함께 자연 스크롤되고, 각 그룹은 자연 높이로 쌓인다.
 */
export function PreviewArea({ group }: Props) {
  const { media } = group
  return (
    <div data-preview-area data-active-group={group.id}>
      {media.type === 'app-launch' && <AppLaunchPreview apps={media.apps} />}
      {media.type === 'promotion-video' && <PromotionVideoPreview {...media} />}
      {media.type === 'personal-video' && <PersonalVideoPreview {...media} />}
    </div>
  )
}
