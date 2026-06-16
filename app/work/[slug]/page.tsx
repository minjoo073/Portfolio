import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { works, getWork, getNextWork } from '@/data/works'
import { WorkViewer } from './WorkViewer'

/**
 * 빌드 시 5개 슬러그를 정적 생성.
 * lunare / fancive / lp / buja / mathhub
 */
export function generateStaticParams() {
  return works.map((w) => ({ slug: w.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const work = getWork(params.slug)
  if (!work) return { title: 'Case Study — Park Minjoo' }
  return {
    title: `${work.label} — Park Minjoo`,
    description: `${work.label} 케이스스터디 — Park Minjoo UX/UI Portfolio`,
  }
}

/**
 * /work/[slug] — 케이스스터디 뷰어 페이지 (서버 컴포넌트 껍데기).
 *
 * 역할:
 *   1. slug 유효성 검사 → 없으면 404
 *   2. work + nextWork 데이터 계산
 *   3. WorkViewer(client) 에 props 전달
 */
export default function WorkPage({ params }: { params: { slug: string } }) {
  const work = getWork(params.slug)
  if (!work) notFound()

  const nextWork = getNextWork(params.slug) ?? null

  return <WorkViewer work={work} nextWork={nextWork} />
}
