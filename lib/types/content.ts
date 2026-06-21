export interface ContentItem {
  id: string
  index: number
  label: string
}

export type Aspect = '1:1' | '3:4' | '4:3' | '4:5' | '16:9'

export type VisualCategory = 'poster' | 'banner'

export interface VisualItem {
  id: string
  index: number
  title: string
  thumbnail: string
  category: VisualCategory
}

/* ─── Content & Marketing — 3그룹 옵션 D ─────────────────── */

export interface AppItem {
  name: string
  icon: string
  qr: string
  storeUrl: string
  publishedDate: string
  subtitle?: string
  /** 통합안 (영수증 메타포 확장) — 자린고비 PreviewArea */
  editionNumber?: string
  titleKr?: string
  titleEn?: string
  releaseDate?: string
  platform?: string
  concept?: string
  role?: string
  buildDuration?: string
  deliverables?: string
  mechanic?: string
  status?: string
  intentStatement?: string
}

export interface PromotionVideo {
  thumbnail: string
  title: string
  /** TikTok video ID — iframe embed 용 */
  videoId?: string
  /** TikTok video URL — 외부 링크 (클릭 시 이동) */
  videoUrl?: string
}

export interface PersonalVideo {
  thumbnail: string
  title?: string
  /** Instagram Reel ID — iframe embed 용 */
  reelId?: string
  /** Instagram Reel URL — 외부 링크 (fallback) */
  reelUrl?: string
}

export interface ChannelInfo {
  handle: string
  concept: string
  url: string
}

export type ContentMedia =
  | {
      type: 'app-launch'
      apps: AppItem[]
    }
  | {
      type: 'promotion-video'
      context: string
      intent: string
      videos: PromotionVideo[]
      process: readonly string[]
      cta: { label: string; href: string }
      /** 통합안 (자린고비 패턴) — 02 PROMOTION PreviewArea */
      editionNumber?: string
      titleKr?: string
      titleSubKr?: string
      titleEn?: string
      releaseDate?: string
      platforms?: string
      campaign?: string
      channel?: string
      format?: string
      role?: string
      tool?: string
      hook?: string
      status?: string
      intentStatement?: string
      instagramUrl?: string
      tiktokUrl?: string
      socialHandle?: string
      instagramHandle?: string
      tiktokHandle?: string
    }
  | {
      type: 'personal-video'
      channel: ChannelInfo
      videos: PersonalVideo[]
      curationNote: string
      /** 통합안 (강팀 회의) — 03 PERSONAL CONTENT */
      editionNumber?: string
      titleEn?: string
      period?: string
      totalReach?: string
      exactReach?: string
      cadence?: string
      format?: string
      editStyle?: string
      role?: string
      status?: string
      intentStatement?: string
      instagramUrl?: string
      instagramHandle?: string
      postsCount?: string
      qrImage?: string
      inbounds?: Array<{
        id: string
        receivedDate: string
        category: string
        quote?: string
        screenshot?: string
      }>
    }

export interface ContentGroup {
  id: string
  index: string
  label: string
  /** 영수증 우측 메타 — '2026', '×4 VIDEOS', 'SELECTED 6' 같은 짧은 라벨 */
  receiptMeta: string
  /** 그룹 라벨 아래 작게 표시되는 sub-lines (1-2줄) */
  subLines: readonly string[]
  media: ContentMedia
}
