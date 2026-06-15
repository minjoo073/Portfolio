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
    <div className="h-full w-full" data-preview-area data-active-group={group.id}>
      {media.type === 'app-launch' && <AppLaunchPreview apps={media.apps} />}
      {media.type === 'promotion-video' && <PromotionVideoPreview {...media} />}
      {media.type === 'personal-video' && <PersonalVideoPreview {...media} />}
    </div>
  )
}
