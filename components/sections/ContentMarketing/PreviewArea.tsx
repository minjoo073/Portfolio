import type { ContentGroup } from '@/lib/types/content'
import { AppLaunchPreview } from './previews/AppLaunchPreview'
import { PromotionVideoPreview } from './previews/PromotionVideoPreview'
import { PersonalVideoPreview } from './previews/PersonalVideoPreview'

interface Props {
  group: ContentGroup
}

/**
 * 호버된 그룹의 미디어 타입에 따라 적절한 preview를 렌더.
 */
export function PreviewArea({ group }: Props) {
  const { media } = group

  return (
    <div
      // 고정 height 로 layout shift 차단 — 호버마다 preview 비율 다름(9:16, 16:9, app-launch)
      // 박스보다 큰 콘텐츠(03 PersonalContent 9:16 grid 등)는 박스 내부에서 세로 스크롤
      // data-lenis-prevent: Lenis 가 박스 안 wheel 이벤트 가로채지 않게 → native 스크롤 작동
      className="h-[85vh] w-full overflow-y-auto overscroll-contain no-scrollbar"
      data-lenis-prevent
      data-preview-area
      data-active-group={group.id}
    >
      {media.type === 'app-launch' && <AppLaunchPreview apps={media.apps} />}
      {media.type === 'promotion-video' && <PromotionVideoPreview {...media} />}
      {media.type === 'personal-video' && <PersonalVideoPreview {...media} />}
    </div>
  )
}
