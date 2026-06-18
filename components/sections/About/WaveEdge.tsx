'use client'

/**
 * WaveEdge — About 검정 면 윗 경계: 종이가 바람에 "얕게 살랑" + 끝이 살짝 입체(3D).
 *
 * 인터랙션 헌법 3조: SVG path + linearGradient + GSAP. **필터 없음**(깜빡임 방지).
 *
 * 설계 (CEO 피드백 2026-06-18):
 *   - 불연속 색 블록(facet) 폐기. 매끈하고 얕은 너울(작게·느리게 = 살랑).
 *   - 끝의 입체감 = 경계를 따라가는 "림 밴드" 하나에 세로 그라데이션(빛 받는 가장자리 →
 *     검정으로 자연 페이드). 끊긴 블록 아닌 연속 그라데이션 → 종이 가장자리가 살짝 말려
 *     빛을 받는 듯한 3D 느낌. 텍스트와 자연스럽게 연결.
 *   - 닿기 전 잠잠, 닿을 때만 살랑.
 *
 * 폴백(5조): reduced/모바일 → ticker 미등록, 정적 얕은 너울 1장.
 */

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap/config'
import { useReducedMotionContext } from '@/components/global/ReducedMotionProvider'
import { useIsMobile } from '@/lib/hooks/useMediaQuery'

const W = 1440
const H = 240
const Y0 = 120
const SEGS = 4 /* 얕은 너울 2개 — 살랑 */
const BAND = 26 /* 입체 림 밴드 높이(px) */
const AMP_BASE = 0.9
const AMP_MAX = 17 /* 지속 너울 최대치 */
const BASE_F = 0.42 /* 지속 너울 — 가늘게(미세) */
const BURST = 24 /* 닿는 순간 확 보이게 펄럭(env 독립 덧셈) */
const TAU = 0.4 /* 아주 잠깐 — 빠르게 잦아듦 */
const DRAIN = 1.5
const DX = W / SEGS

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}
const envelope = (cv: number) => smoothstep(1, 0, cv) * (1 - smoothstep(0, -DRAIN, cv))

/* 노드 y — 매끈한 얕은 너울. 중앙 잠잠·끝 살짝 더 살랑(엣지 바이어스 약하게) */
const yAt = (i: number, a: number, phase: number) => {
  const t = i / SEGS
  const edge = 0.6 + 0.4 * Math.pow(Math.abs(2 * t - 1), 1.5)
  return Y0 - a * edge * Math.sin(phase + i * 1.15)
}

/* 매끈한 베지어 윗선(살랑). topOnly=true 면 닫지 않고 윗선만(림 밴드용) */
function topEdge(a: number, phase: number): string {
  const h = DX / 2
  let d = `M0,${yAt(0, a, phase).toFixed(2)}`
  for (let i = 0; i < SEGS; i++) {
    const x0 = i * DX
    const x1 = (i + 1) * DX
    const y0 = yAt(i, a, phase)
    const y1 = yAt(i + 1, a, phase)
    d += ` C${(x0 + h).toFixed(2)},${y0.toFixed(2)} ${(x1 - h).toFixed(2)},${y1.toFixed(2)} ${x1.toFixed(2)},${y1.toFixed(2)}`
  }
  return d
}

const STATIC = `M0,${H} ${topEdge(6, 0).slice(1)} L${W},${H} Z`

export function WaveEdge() {
  const reduced = useReducedMotionContext()
  const isMobile = useIsMobile()
  const live = !reduced && !isMobile
  const svgRef = useRef<SVGSVGElement>(null)
  const bodyRef = useRef<SVGPathElement>(null)
  const rimRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    if (!live) return
    const svg = svgRef.current
    const body = bodyRef.current
    const rim = rimRef.current
    if (!svg || !body || !rim) return

    let cvPrev = Infinity
    let kickAt = -10
    let phase = 0
    let group: HTMLElement | null = null
    let lastQuery = -1

    const tick = (time: number, deltaMs: number) => {
      if (!group || time - lastQuery > 0.5) {
        group = document.querySelector<HTMLElement>('[data-hero-title-group]')
        lastQuery = time
      }
      const b = svg.getBoundingClientRect()
      const waterY = b.top + b.height * 0.5
      if (waterY < -H || waterY > window.innerHeight + H) return
      if (!group) {
        body.setAttribute('d', STATIC)
        rim.setAttribute('opacity', '0')
        cvPrev = Infinity
        return
      }

      const vw = window.innerWidth
      const fontSize = Math.min(360, Math.max(72, 0.19 * vw))
      const g = group.getBoundingClientRect()
      const cv = (waterY - (g.top + g.height * 0.18)) / fontSize
      if (cvPrev > 1 && cv <= 1) kickAt = time
      cvPrev = cv

      const env = envelope(cv)
      const kick = Math.exp(-(time - kickAt) / TAU) /* 0..1 펄스 */
      /* 지속 살랑(env*BASE_F) + 닿는 순간 펄럭(BURST*kick, env와 독립) */
      const a = AMP_BASE + AMP_MAX * env * BASE_F + BURST * kick
      /* 평상시 느린 살랑 + 닿는 순간만 잠깐 빨라져 "펄럭" */
      phase += 2 * Math.PI * (0.12 + 0.16 * env + 0.9 * kick) * (deltaMs / 1000)

      const edge = topEdge(a, phase)
      /* 검정 body — 윗선 아래 전부 채움 */
      body.setAttribute('d', `M0,${H} ${edge.slice(1)} L${W},${H} Z`)
      /* 입체 림 — 윗선 → BAND 만큼 아래(평행). 세로 그라데이션이 빛→검정 연속 페이드 */
      rim.setAttribute('d', `${edge} L${W},${(yAt(SEGS, a, phase) + BAND).toFixed(2)} ${revBottom(a, phase)} Z`)
      rim.setAttribute('opacity', String(0.35 + 0.65 * env))
    }

    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
    }
  }, [live])

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      shapeRendering="geometricPrecision"
      style={{ display: 'block' }}
    >
      <defs>
        {/* 림 그라데이션 — 가장자리(빛) → 검정. 끊긴 블록 아닌 연속 페이드(입체감). 필터 아님. */}
        <linearGradient id="paper-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b2b2b" />
          <stop offset="0.45" stopColor="#181818" />
          <stop offset="1" stopColor="#0A0A0A" />
        </linearGradient>
      </defs>
      {/* 검정 body */}
      <path ref={bodyRef} fill="#0A0A0A" d={STATIC} />
      {/* 입체 림 밴드 (live 일 때만) */}
      {live && <path ref={rimRef} fill="url(#paper-rim)" d="" opacity="0" />}
    </svg>
  )
}

/* 림 밴드의 아래쪽(윗선을 BAND 만큼 내린 것)을 오른→왼 역방향 베지어로 */
function revBottom(a: number, phase: number): string {
  const h = DX / 2
  let d = ''
  for (let i = SEGS; i > 0; i--) {
    const x1 = i * DX
    const x0 = (i - 1) * DX
    const y1 = yAt(i, a, phase) + BAND
    const y0 = yAt(i - 1, a, phase) + BAND
    d += ` C${(x1 - h).toFixed(2)},${y1.toFixed(2)} ${(x0 + h).toFixed(2)},${y0.toFixed(2)} ${x0.toFixed(2)},${y0.toFixed(2)}`
  }
  return d.trim()
}
