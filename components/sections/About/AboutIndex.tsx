'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { about } from '@/data/about'
import { registerGsap, gsap } from '@/lib/gsap/config'

/**
 * AboutIndex — CEO 지시 적용.
 *
 * 구조 (2단):
 *   좌 col-7  사진 240×320  →  manifesto (사진 직속 하단)  →  본문 4문단
 *   우 col-5  2×2 그리드 (About/Edu, Cert/Skills) — 모든 컬럼 통일 (Skills 박스 제거)
 *
 * 모션: 옵션 C 현상액
 */
export function AboutIndex() {
  const rootRef = useRef<HTMLDivElement>(null)

  // 모션은 About.tsx 부모에서 pin + Counter-Scroll 통합 관리

  return (
    <div
      ref={rootRef}
      className="px-side-m md:px-side-t xl:px-side-d"
      style={{ paddingTop: 160, paddingBottom: 64 }}
    >
      <div
        style={{
          display: 'flex',
          gap: 40,
          alignItems: 'stretch'
        }}
      >
        {/* ─ 좌측 column — 사진 + manifesto + 본문 (세로 스택) ─ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: '0 1 auto',
            maxWidth: 640
          }}
        >
          <div
            className="bg-dark-soft relative overflow-hidden"
            style={{ width: 240, height: 320, flexShrink: 0 }}
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

          <h3
            className="font-kr text-ink-inverse font-semibold leading-[1.15] tracking-[-0.025em]"
            style={{ fontSize: 'clamp(36px, 3.2vw, 48px)', marginTop: 40, marginBottom: 24 }}
          >
            {about.profile.taglineLines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h3>

          <div
            className="font-kr text-ink-inverse/85 flex flex-col text-[15px] leading-[1.75]"
            style={{ gap: 12 }}
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
        </div>

        {/* ─ 우측 column — 2x2 grid, height stretch (좌측 전체 height 따라) ─ */}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 40,
            paddingTop: 0
          }}
        >
          <Column en="About" kr="기본정보">
            <div className="font-kr text-ink-inverse flex flex-col gap-2 text-[15px]">
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

          <Column en="Education" kr="학력사항">
            <ul className="flex flex-col gap-3">
              {about.education.map((e) => (
                <li key={e.name} className="flex flex-col gap-0.5">
                  <span className="font-kr text-ink-inverse text-[15px]">{e.name}</span>
                  <span className="font-kr text-ink-inverse/55 text-[12px]">{e.status}</span>
                </li>
              ))}
            </ul>
          </Column>

          <Column en="Certificate" kr="자격증">
            <ul className="flex flex-col gap-2.5">
              {about.certificates.map((c) => (
                <li key={c.name} className="flex flex-col gap-0.5">
                  <span className="font-kr text-ink-inverse text-[14px] leading-[1.35]">
                    {c.name}
                  </span>
                  {(c.issuer || c.date) && (
                    <span className="font-kr text-ink-inverse/55 text-[12px]">
                      {c.issuer ?? ''}
                      {c.issuer && c.date ? ' ㅣ ' : ''}
                      {c.date ?? ''}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Column>

          <Column en="Skills" kr="사용 프로그램">
            <div className="flex flex-col gap-3">
              {Object.entries(about.skills).map(([cat, items]) => (
                <div key={cat} className="flex flex-col gap-1">
                  <span className="font-kr text-ink-inverse/55 text-[12px]">{cat}</span>
                  <div className="flex flex-wrap gap-x-2.5 gap-y-0.5">
                    {(items as readonly string[]).map((t, idx, arr) => (
                      <span key={t} className="font-kr text-ink-inverse text-[14px]">
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
        </div>
      </div>
    </div>
  )
}

/**
 * Column — image #24 구조: 헤더(좌) | 콘텐츠(우) 가로 분리.
 * 인라인 style 로 JIT 의존 회피 (Tailwind flex 클래스 hot reload 깨짐 패턴).
 * 2x2 그리드 안 좁은 셀(~280px) 가정: 헤더 width 100, 콘텐츠 flex-1.
 */
function Column({
  en,
  kr,
  children
}: {
  en: string
  kr: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', gap: 32 }}>
      <header
        style={{ width: 120, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <h4
          className="font-kr text-ink-inverse font-semibold leading-[1.05] tracking-[-0.02em]"
          style={{ fontSize: 'clamp(18px, 1.5vw, 22px)' }}
        >
          {en}
        </h4>
        <span className="font-kr text-ink-inverse/55 text-[12px]">{kr}</span>
      </header>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  )
}
