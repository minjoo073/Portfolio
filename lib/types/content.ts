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
}

export interface PromotionVideo {
  thumbnail: string
  title: string
}

export interface PersonalVideo {
  thumbnail: string
  title?: string
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
    }
  | {
      type: 'personal-video'
      channel: ChannelInfo
      videos: PersonalVideo[]
      curationNote: string
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
