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

/** Content & Marketing 진입 한글 paragraph (**...** 구절은 밝게 강조 — ContentMarketing.tsx 파서) */
export const contentBody = [
  '**디자인 외의 영역**에서도,',
  '앱 출시부터 SNS 운영, 마케팅 콘텐츠 기획과 숏폼 영상 제작까지,',
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
      '팀 프로젝트 (디자인 & 마케팅 담당)',
      '구글 플레이 스토어 앱 출시'
    ],
    media: {
      type: 'app-launch',
      apps: [
        {
          name: '자린고비',
          icon: '/images/content/app-01/로고.png',
          qr: '/images/content/app-01/자린고비.png',
          storeUrl: 'https://play.google.com/store/apps/details?id=jaringobi.myapp&pli=1',
          publishedDate: 'May 2026',
          subtitle: 'Solo design + marketing',
          // 통합안 (강팀 회의)
          editionNumber: '01',
          titleKr: '앱 출시 - 자린고비',
          titleEn: 'Jaringobi',
          releaseDate: 'May 2026',
          platform: 'Android',
          concept: '절약 게임화',
          role: '디자인 + 마케팅',
          buildDuration: '4주',
          deliverables: 'UI · Icon · Store · Copy',
          mechanic: '절약 → 코인 → 캐릭터',
          status: '출시 · 2026년 5월',
          intentStatement: 'Spend less, dress more — 절약으로 모은 코인으로 나만의 캐릭터를 꾸미다',
        }
      ]
    }
  },
  {
    id: 'promotion',
    index: '02',
    label: 'SNS MARKETING',
    receiptMeta: '대표 4편',
    subLines: [
      '1인 진행 (기획 → 촬영 → 편집)',
      '15초 티저 시리즈 · 대표 영상 4편'
    ],
    media: {
      type: 'promotion-video',
      context: 'Pre-launch campaign · 자린고비',
      intent: "Introduce the app's core value to first-time users in 15 seconds.",
      videos: [
        {
          thumbnail: '/images/content/promo/IMG_7047.jpeg',
          title: 'Teaser 01',
          videoId: '7634462452570148103',
          videoUrl: 'https://www.tiktok.com/@4poor6/video/7634462452570148103',
        },
        {
          thumbnail: '/images/content/promo/IMG_7048.jpeg',
          title: 'Teaser 02',
          videoId: '7634516294640962824',
          videoUrl: 'https://www.tiktok.com/@4poor6/video/7634516294640962824',
        },
        {
          thumbnail: '/images/content/promo/IMG_7050.jpeg',
          title: 'Teaser 03',
          videoId: '7634702961037364498',
          videoUrl: 'https://www.tiktok.com/@4poor6/video/7634702961037364498',
        },
        {
          thumbnail: '/images/content/promo/IMG_7051.jpeg',
          title: 'Teaser 04',
          videoId: '7634904330772188423',
          videoUrl: 'https://www.tiktok.com/@4poor6/video/7634904330772188423',
        },
      ],
      process: ['STRATEGY', 'CONCEPT', 'STORYBOARD', 'EDIT', 'PUBLISH'],
      cta: { label: 'Watch Campaign', href: '#' },
      // 통합안 (강팀 회의)
      editionNumber: '02',
      titleKr: '런칭 캠페인',
      titleSubKr: '티저 시리즈',
      titleEn: 'JARINGOBI · TEASER',
      releaseDate: 'May 2026',
      platforms: 'IG / TikTok',
      campaign: 'Build-in-Public',
      channel: 'Instagram / TikTok',
      format: '15초 티저 4편 + 메이킹 1편',
      role: '기획 · 촬영 · 편집 (1인)',
      tool: 'Premiere · CapCut',
      hook: '3초 — 사운드 중심',
      status: 'Published',
      intentStatement: 'Build in public — 만드는 과정이 광고가 된다',
      instagramUrl: 'https://www.instagram.com/4poor_project/',
      tiktokUrl: 'https://www.tiktok.com/@4poor6',
      instagramHandle: '@4poor_project',
      tiktokHandle: '@4poor6',
      socialHandle: '@4poor_project',
    }
  },
  {
    id: 'personal',
    index: '03',
    label: 'PERSONAL CONTENT',
    receiptMeta: '80K 도달',
    subLines: [
      '@fancy._ju · 개인 콘텐츠 채널',
      '3개월 80K 도달 · 협업 제안'
    ],
    media: {
      type: 'personal-video',
      channel: {
        handle: '@fancy._ju',
        concept: 'Study log vlog — UI/UX 학원 다니면서 일상 + 공부 기록',
        url: 'https://www.instagram.com/fancy._ju/'
      },
      videos: [
        {
          thumbnail: '/images/content/personal/14.jpeg',
          title: 'Reel 01',
          reelId: 'DWOf8Xvibxx',
          reelUrl: 'https://www.instagram.com/reel/DWOf8Xvibxx/',
        },
        {
          thumbnail: '/images/content/personal/23.jpeg',
          title: 'Reel 02',
          reelId: 'DWyohIZiZjA',
          reelUrl: 'https://www.instagram.com/reel/DWyohIZiZjA/',
        },
        {
          thumbnail: '/images/content/personal/38.jpeg',
          title: 'Reel 03',
          reelId: 'DXorBIQCXLk',
          reelUrl: 'https://www.instagram.com/reel/DXorBIQCXLk/',
        },
        {
          thumbnail: '/images/content/personal/40.jpeg',
          title: 'Reel 04',
          reelId: 'DXt2SkcCWyR',
          reelUrl: 'https://www.instagram.com/reel/DXt2SkcCWyR/',
        },
      ],
      curationNote: '3개월 동안 학원에서 디자인 공부하는 일상을 꾸준히 기록한 채널.',
      // 통합안 (강팀 회의)
      editionNumber: '03',
      titleEn: 'STUDY LOG · 학습 일지',
      period: '2026.03 — 05',
      totalReach: '80K',
      exactReach: '80,193 views',
      cadence: '3–4 posts / week',
      format: 'VLOG · STUDY LOG',
      editStyle: 'Solo (shoot · cut · cover)',
      role: '기획 · 촬영 · 편집 (1인)',
      status: 'Active',
      postsCount: '40편 이상',
      intentStatement: 'Study log, brand-called — 공부 로그가 브랜드를 부르다',
      instagramUrl: 'https://www.instagram.com/fancy._ju/',
      instagramHandle: '@fancy._ju',
      qrImage: '/images/content/personal/fancy._ju_qr.png',
      inbounds: [
        {
          id: 'medicube',
          receivedDate: '2026.04.20',
          category: 'MEDICUBE · BEAUTY / OLIVE YOUNG',
          quote: '안녕하세요 :) 피부를 연구하는 브랜드 메디큐브 올리브영 마케팅팀입니다. 4월 올리브영 기획 협업 문의 드리고자 연락드렸습니다.',
          screenshot: '/images/content/personal/medicube_1.jpeg',
        },
        {
          id: 'ponder-ai',
          receivedDate: '2026.05.06',
          category: 'PONDER AI · KOREA',
          quote: '안녕하세요 크리에이터님, Ponder AI Korea팀입니다. Ponder는 지식인을 위한 AI 리서치 워크스페이스입니다. 크리에이터님의 콘텐츠를 인상 깊게 보고 연락드립니다!',
          screenshot: '/images/content/personal/ponder_1.jpeg',
        },
      ],
    }
  }
]
