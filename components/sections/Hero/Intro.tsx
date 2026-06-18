'use client'

/**
 * Intro — 미니멀 로더 (mantis.works 모션 레퍼런스, CEO 지정 2026-06-18).
 *
 * 모션:
 *   - 화면 중앙 풀폭 연한 가로선(1px, ink/20).
 *   - % 텍스트(모노)가 선 위를 **왼→오로 이동** (위치 = 진행률). fill 아님 — 텍스트 이동.
 *   - 로딩 도중 ~18% 에서 살짝 멈칫했다가 다시 로딩(실제 로더 느낌).
 *   - 선 아래 좌측: 이름(세미볼드, 절제) + 작은 설명(모노).
 *   - 100% → 페이드로 Hero 진입.
 *
 * 헌법: CSS/GSAP, quiet luxury. 스크롤 잠금은 onComplete + 안전 타임아웃으로 해제.
 */

import { useEffect, useRef, useState } from 'react'
import { registerGsap, gsap } from '@/lib/gsap/config'
import { useLenis } from '@/lib/hooks/useLenis'

export function Intro() {
  const [visible, setVisible] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const groupRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<HTMLDivElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)

  const lenis = useLenis()
  const lenisRef = useRef(lenis)
  useEffect(() => {
    lenisRef.current = lenis
  }, [lenis])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)
    lenisRef.current?.stop()

    const unlock = () => {
      document.body.style.overflow = ''
      window.scrollTo(0, 0)
      lenisRef.current?.start()
    }

    if (reduced) {
      const id = window.setTimeout(() => {
        setVisible(false)
        unlock()
      }, 300)
      return () => {
        clearTimeout(id)
        unlock()
      }
    }

    const cont = containerRef.current
    const group = groupRef.current
    const marker = markerRef.current
    const pct = pctRef.current
    if (!cont || !group || !marker || !pct) {
      unlock()
      return
    }

    registerGsap()
    gsap.set(group, { opacity: 0 })

    const prog = { p: 0 }
    const update = () => {
      pct.textContent = String(Math.round(prog.p))
      // 숫자가 선을 끝까지(우측 끝) 타고 감 — 100% 면 left 100%(선 우측 끝).
      marker.style.left = `${prog.p}%`
    }

    const finish = () => {
      setVisible(false)
      unlock()
    }
    const safety = window.setTimeout(finish, 5200)

    const tl = gsap.timeline({
      onComplete: () => {
        clearTimeout(safety)
        finish()
      },
    })

    // ① 선·이름 등장
    tl.to(group, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0)

    // ② % 텍스트가 선 위를 왼→오 이동 — ~18% 에서 살짝 멈칫(느려짐) 후 다시 로딩(느긋하게)
    tl.to(prog, { p: 18, duration: 0.5, ease: 'power1.out', onUpdate: update }, 0.85)
    tl.to(prog, { p: 23, duration: 0.65, ease: 'sine.inOut', onUpdate: update }, '>') // 살짝 늦췄다가
    tl.to(prog, { p: 100, duration: 2.2, ease: 'power1.inOut', onUpdate: update }, '>') // 다시 로딩(더 느리게)

    // ③ 100% → 잠깐 머문 뒤 느긋한 페이드로 Hero 진입
    tl.to(cont, { opacity: 0, duration: 0.95, ease: 'power2.inOut' }, '>+0.4')

    return () => {
      clearTimeout(safety)
      tl.kill()
      unlock()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!visible) return null

  return (
    <div ref={containerRef} aria-hidden="true" className="fixed inset-0 z-[110] bg-hero-bg">
      {/* 화면 중앙에 로더(선 + 이동 % + 이름) 배치 */}
      <div
        ref={groupRef}
        className="absolute inset-x-side-m md:inset-x-side-t xl:inset-x-side-d top-1/2 -translate-y-1/2"
      >
        {/* 풀폭 가로선 + 선 위를 타고 이동하는 % (숫자 배경이 선을 끊어 "선상에 올라탄" 모양) */}
        <div className="relative h-px w-full bg-ink-primary/20">
          <div
            ref={markerRef}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-hero-bg px-2.5 font-mono text-[11px] leading-none tracking-[0.04em] text-ink-primary"
            style={{ left: '0%' }}
          >
            <span ref={pctRef}>0</span>%
          </div>
        </div>

        {/* 선 아래 좌측: 이름 + 작은 설명 (절제·세미볼드) */}
        <div className="mt-5 flex items-end gap-2.5">
          <span
            className="font-sans font-semibold text-ink-primary select-none"
            style={{ fontSize: 'clamp(20px, 2.2vw, 30px)', letterSpacing: '-0.01em' }}
          >
            PARK MINJOO
          </span>
          <span className="font-mono text-[9px] uppercase leading-[1.35] tracking-[0.1em] text-ink-muted pb-[6px]">
            UX/UI
            <br />
            DESIGNER
          </span>
        </div>
      </div>
    </div>
  )
}
