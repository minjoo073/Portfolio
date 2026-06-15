import type { VisualItem } from '@/lib/types/content'

/**
 * Visual Works — 포스터 6 + 배너 4 = 10개 placeholder.
 * 가로 트랙에 sequential 배치 (포스터 → 배너).
 * 비율 차이로 카테고리 자연 구분.
 */
export const visualWorks: VisualItem[] = [
  // ── Posters (4:5 portrait) × 6 ──
  { id: 'p1', index: 1, category: 'poster', title: 'V01', thumbnail: '/images/visual/p01.webp' },
  { id: 'p2', index: 2, category: 'poster', title: 'V02', thumbnail: '/images/visual/p02.webp' },
  { id: 'p3', index: 3, category: 'poster', title: 'V03', thumbnail: '/images/visual/p03.webp' },
  { id: 'p4', index: 4, category: 'poster', title: 'V04', thumbnail: '/images/visual/p04.webp' },
  { id: 'p5', index: 5, category: 'poster', title: 'V05', thumbnail: '/images/visual/p05.webp' },
  { id: 'p6', index: 6, category: 'poster', title: 'V06', thumbnail: '/images/visual/p06.webp' },

  // ── Banners (16:9 landscape) × 4 ──
  { id: 'b1', index: 7, category: 'banner', title: 'V07', thumbnail: '/images/visual/b01.webp' },
  { id: 'b2', index: 8, category: 'banner', title: 'V08', thumbnail: '/images/visual/b02.webp' },
  { id: 'b3', index: 9, category: 'banner', title: 'V09', thumbnail: '/images/visual/b03.webp' },
  { id: 'b4', index: 10, category: 'banner', title: 'V10', thumbnail: '/images/visual/b04.webp' }
]
