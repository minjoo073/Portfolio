'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { about } from '@/data/about'
import { registerGsap, gsap, ScrollTrigger } from '@/lib/gsap/config'
import { useIsMobile } from '@/lib/hooks/useMediaQuery'

/**
 * AboutIndex — sticky + scrub reveal (옵션 C-revised, 2026-06-21).
 *
 * 데스크탑:
 *   outer (tall 200vh, position: relative)
 *   └── sticky wrapper (top: 0, height: 100vh)
 *       └── content (flex, 좌:사진+텍스트 / 우:2x2 grid)
 *   모션: scrub 0.6 timeline. reduced-motion: skip → 정적 표시.
 *
 * 모바일(≤767px):
 *   sticky/scrub 없이 세로 스택 (사진 → 태그라인 → 본문 → 정보 4블록 세로).
 *   Column 도 헤더가 콘텐츠 위로 쌓임.
 */
export function AboutIndex() {
  const outerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isMobile) return // 모바일: 세로 스택(아래 분기) → sticky/scrub 미사용
    const outer = outerRef.current
    const content = contentRef.current
    if (!outer || !content) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    registerGsap()

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>('[data-reveal]')
      if (!targets.length) return

      // 초기: 하단 100% 클립 (가림) + 살짝 내려둠
      gsap.set(targets, { clipPath: 'inset(0% 0% 100% 0%)', y: 8 })

      // scrub timeline — sticky 진행률 따라 stagger reveal
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: outer,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
        },
      })

      targets.forEach((target, i) => {
        tl.to(
          target,
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            y: 0,
            ease: 'power3.out',
            duration: 0.6,
          },
          i * 0.12
        )
      })

      ScrollTrigger.refresh()
    }, content)

    return () => ctx.revert()
  }, [isMobile])

  /* ── 좌측(데스크탑) / 상단(모바일) 공용: 사진 + 태그라인 + 본문 ─────────── */
  const photo = (
    <div
      className="bg-dark-soft relative overflow-hidden"
      style={{ width: 240, height: 320, flexShrink: 0 }}
      data-reveal
    >
      <Image
        src="/images/about/profile.jpg"
        alt={`${about.basicInfo.name} 프로필 사진`}
        fill
        sizes="240px"
        className="object-cover"
        quality={90}
      />
    </div>
  )

  const tagline = (
    <h3
      className="font-kr text-ink-inverse font-semibold leading-[1.15] tracking-[-0.025em]"
      style={{ fontSize: 'clamp(36px, 3.2vw, 48px)', marginTop: 40, marginBottom: 24 }}
      data-reveal
    >
      {about.profile.taglineLines.map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
      ))}
    </h3>
  )

  const intro = (
    <div
      className="font-kr text-ink-inverse/85 flex flex-col text-[16px] leading-[1.75]"
      style={{ gap: 12 }}
      data-reveal
    >
      {about.profile.intro.map((para, i) => (
        <p key={i}>
          {para.split('\n').map((line, j) => (
            <span key={j} style={{ display: 'block' }}>
              {line}
            </span>
          ))}
        </p>
      ))}
    </div>
  )

  /* ── 정보 4블록 (데스크탑 2x2 grid / 모바일 세로 스택 공용) ──────────────── */
  const columns = (
    <>
      <Column en="About" kr="기본정보" mobile={isMobile}>
        <div className="font-kr text-ink-inverse flex flex-col gap-2 text-[17px]">
          <span>{about.basicInfo.birth}</span>
          <span>{about.basicInfo.name}</span>
          <span>{about.basicInfo.phone}</span>
          <a
            href={`mailto:${about.basicInfo.email}`}
            className="hover:text-ink-inverse/70 transition-colors"
          >
            {about.basicInfo.email}
          </a>
        </div>
      </Column>

      <Column en="Education" kr="학력사항" mobile={isMobile}>
        <ul className="flex flex-col gap-3">
          {about.education.map((e) => (
            <li key={e.name} className="flex flex-col gap-0.5">
              <span className="font-kr text-ink-inverse text-[17px]">{e.name}</span>
              <span className="font-kr text-ink-inverse/55 text-[14px]">{e.status}</span>
            </li>
          ))}
        </ul>
      </Column>

      <Column en="Certificate" kr="자격증" mobile={isMobile}>
        <ul className="flex flex-col gap-2.5">
          {about.certificates.map((c) => (
            <li key={c.name} className="flex flex-col gap-0.5">
              <span className="font-kr text-ink-inverse text-[16px] leading-[1.35]">
                {c.name}
              </span>
              {(c.issuer || c.date) && (
                <span className="font-kr text-ink-inverse/55 text-[14px]">
                  {c.issuer ?? ''}
                  {c.issuer && c.date ? ' ㅣ ' : ''}
                  {c.date ?? ''}
                </span>
              )}
            </li>
          ))}
        </ul>
      </Column>

      <Column en="Skills" kr="사용 프로그램" mobile={isMobile}>
        <div className="flex flex-col gap-3">
          {Object.entries(about.skills).map(([cat, items]) => (
            <div key={cat} className="flex flex-col gap-1">
              <span className="font-kr text-ink-inverse/55 text-[14px]">{cat}</span>
              <div className="flex flex-wrap gap-x-2.5 gap-y-0.5">
                {(items as readonly string[]).map((t, idx, arr) => (
                  <span key={t} className="font-kr text-ink-inverse text-[16px]">
                    {t}
                    {idx < arr.length - 1 && (
                      <span className="text-ink-inverse/30 ml-2.5">·</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Column>
    </>
  )

  /* ── 모바일: 세로 스택 (sticky/scrub 없음) ──────────────────────────────── */
  if (isMobile) {
    return (
      <div
        className="px-side-m"
        style={{ paddingTop: 'clamp(48px, 8vh, 80px)', paddingBottom: 'clamp(56px, 10vh, 88px)' }}
      >
        {photo}
        {tagline}
        {intro}
        <div className="flex flex-col" style={{ gap: 36, marginTop: 44 }}>
          {columns}
        </div>
      </div>
    )
  }

  /* ── 데스크탑: sticky + scrub 2단 ───────────────────────────────────────── */
  return (
    <div ref={outerRef} style={{ position: 'relative', height: '200vh' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <div
          ref={contentRef}
          className="px-side-m md:px-side-t xl:px-side-d"
          style={{
            height: '100%',
            paddingTop: 'clamp(80px, 10vh, 140px)',
            paddingBottom: 'clamp(40px, 6vh, 80px)',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ display: 'flex', gap: 40, alignItems: 'stretch', width: '100%' }}>
            {/* ─ 좌측 column — 사진 + manifesto + 본문 (세로 스택) ─ */}
            <div
              style={{ display: 'flex', flexDirection: 'column', flex: '0 1 auto', maxWidth: 640 }}
            >
              {photo}
              {tagline}
              {intro}
            </div>

            {/* ─ 우측 column — 2x2 grid, height stretch ─ */}
            <div
              style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, paddingTop: 0 }}
            >
              {columns}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Column — 데스크탑: 헤더(좌 120px) | 콘텐츠(우) 가로 분리.
 *          모바일: 헤더가 콘텐츠 위로 세로 스택.
 * 인라인 style 로 JIT 의존 회피.
 */
function Column({
  en,
  kr,
  children,
  mobile = false,
}: {
  en: string
  kr: string
  children: React.ReactNode
  mobile?: boolean
}) {
  return (
    <div
      style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: mobile ? 12 : 32 }}
      data-reveal
    >
      <header
        style={{
          width: mobile ? 'auto' : 120,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <h4
          className="font-kr text-ink-inverse font-semibold leading-[1.05] tracking-[-0.02em]"
          style={{ fontSize: 'clamp(18px, 1.5vw, 22px)' }}
        >
          {en}
        </h4>
        <span className="font-kr text-ink-inverse/55 text-[13px]">{kr}</span>
      </header>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  )
}
