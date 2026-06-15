import type { ContentItem, ContentGroup } from '@/lib/types/content'

export const contentItems: ContentItem[] = [
  { id: 'c1', index: 1, label: 'App Launch' },
  { id: 'c2', index: 2, label: 'Google Play Published' },
  { id: 'c3', index: 3, label: 'SNS Promotion' },
  { id: 'c4', index: 4, label: 'Reels Content' },
  { id: 'c5', index: 5, label: 'Personal Vlog' },
  { id: 'c6', index: 6, label: 'Content Creation' },
  { id: 'c7', index: 7, label: 'Marketing Experience' }
]

export const contentMarqueeWords = [
  'Content',
  'Marketing',
  'Launch',
  'SNS',
  'Vlog',
  'Promotion'
] as const

/** Content & Marketing 진입 한글 paragraph — placeholder */
export const contentBody = [
  '디자인 외의 영역에서도',
  '앱 출시와 SNS 운영, 마케팅 콘텐츠 제작 경험을 통해',
  '브랜드가 사용자에게 닿는 과정을 직접 만들어 왔습니다.'
] as const

/* ─── 3그룹 (옵션 D) ──────────────────────────────────
   사용자 본인 콘텐츠로 교체 가능한 placeholder.
   썸네일/QR/링크는 후속 단계에서 실제 자료로 대체.
*/
export const contentGroups: ContentGroup[] = [
  {
    id: 'app-launch',
    index: '01',
    label: 'APP LAUNCH',
    receiptMeta: '2026',
    subLines: [
      'Solo design + development',
      'Published on Google Play'
    ],
    media: {
      type: 'app-launch',
      apps: [
        {
          name: 'App Name',
          icon: '/images/content/app-01/icon.png',
          qr: '/images/content/app-01/qr.png',
          storeUrl: 'https://play.google.com/store/',
          publishedDate: '2026',
          subtitle: 'Solo design + development'
        }
      ]
    }
  },
  {
    id: 'promotion',
    index: '02',
    label: 'PROMOTION',
    receiptMeta: '×4 VIDEOS',
    subLines: [
      '15-second teaser series',
      'Strategy → Concept → Storyboard → Edit → Publish'
    ],
    media: {
      type: 'promotion-video',
      context: 'Pre-launch campaign · App Name',
      intent: "Introduce the app's core value to first-time users in 15 seconds.",
      videos: [
        { thumbnail: '/images/content/promo/01.webp', title: 'Teaser 01' },
        { thumbnail: '/images/content/promo/02.webp', title: 'Teaser 02' },
        { thumbnail: '/images/content/promo/03.webp', title: 'Teaser 03' },
        { thumbnail: '/images/content/promo/04.webp', title: 'Teaser 04' }
      ],
      process: ['STRATEGY', 'CONCEPT', 'STORYBOARD', 'EDIT', 'PUBLISH'],
      cta: { label: 'Watch Campaign', href: '#' }
    }
  },
  {
    id: 'personal',
    index: '03',
    label: 'PERSONAL CONTENT',
    receiptMeta: 'SELECTED 6',
    subLines: [
      '@username · Personal vlog',
      'Studying design in 2026'
    ],
    media: {
      type: 'personal-video',
      channel: {
        handle: '@username',
        concept: 'Personal vlog while studying design',
        url: 'https://instagram.com/'
      },
      videos: [
        { thumbnail: '/images/content/personal/01.webp' },
        { thumbnail: '/images/content/personal/02.webp' },
        { thumbnail: '/images/content/personal/03.webp' },
        { thumbnail: '/images/content/personal/04.webp' },
        { thumbnail: '/images/content/personal/05.webp' },
        { thumbnail: '/images/content/personal/06.webp' }
      ],
      curationNote: 'Selected 6 from a personal channel run alongside design studies in 2026.'
    }
  }
]
