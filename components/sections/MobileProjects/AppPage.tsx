'use client'

/**
 * AppPage — 매거진 펼친 면 (page 1 · 2 공유)
 *
 * 구조:
 *   좌 50vw: 폰 mock (중앙 정렬, maxHeight 78vh, 9:19.5)
 *   책등 hairline 60vh (수직 중앙)
 *   우 50vw: 단일 컬럼 위계 (2026-06-22 재편 — A안: Editorial Spec Sheet)
 *     top 메타(1줄) → 워드마크 → tagline → uxIntent → 크레딧(1인 워크플로우 강조)
 *     → 기술 메타(1줄) → 제작과정 풀폭 바 CTA → try 링크
 *
 * data-reveal: MobileProjects 에서 revealPage()/resetPage() 대상 수집
 */

import { useEffect, useState } from 'react'
import { PhoneMockup } from './PhoneMockup'
import { StudyDrawer } from './StudyDrawer'
import type { MobileProject } from '@/lib/types/mobile-project'

/* ── vw 스케일 헬퍼 (base 1920) ──────────────────────────────────── */
const vw = (basePx: number, minPx: number) =>
  `clamp(${minPx}px, ${((basePx / 1920) * 100).toFixed(4)}vw, ${basePx}px)`

/* ── 토큰 ──────────────────────────────────────────────────────────── */
const INK_100 = 'rgba(248,247,244,1.00)'
const INK_85  = 'rgba(248,247,244,0.85)'
const INK_80  = 'rgba(248,247,244,0.80)'
const INK_60  = 'rgba(248,247,244,0.60)'
const INK_55  = 'rgba(248,247,244,0.55)'
const INK_45  = 'rgba(248,247,244,0.45)'
const INK_30  = 'rgba(248,247,244,0.30)'
const HAIR_STR = 'rgba(248,247,244,0.14)'

const MONO = 'var(--font-mono), var(--font-pretendard), monospace'
const KR = 'var(--font-pretendard), sans-serif'
const DISPLAY = 'var(--font-display), var(--font-pretendard), sans-serif'

/* ── ExtLink ────────────────────────────────────────────────────────── */
function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: MONO,
        fontSize: vw(15, 13),
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: INK_55,
        textDecoration: 'none',
        transition: 'color 300ms ease',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLAnchorElement).style.color = INK_100
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLAnchorElement).style.color = INK_55
      }}
    >
      <span>{children}</span>
      <span style={{ display: 'inline-block', fontSize: '11px' }}>↗</span>
    </a>
  )
}

/* ── PrimaryCta — 핵심 CTA (박스·글라스 X). 큰 텍스트 + 밑줄 + 화살표 ──────
   editorial 링크 어포던스. drawer(onClick) 또는 외부 링크(href) 겸용.
   자린고비 = 제작과정 보기(drawer) / TripMate = 웹앱 바로가기(외부 링크). */
function PrimaryCta({
  label,
  caption,
  href,
  onClick,
  external = false,
}: {
  label: string
  caption: string
  href?: string
  onClick?: () => void
  external?: boolean
}) {
  const [hover, setHover] = useState(false)
  const inner = (
    <>
      <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '14px' }}>
        <span style={{ position: 'relative', display: 'inline-block', paddingBottom: '7px' }}>
          <span style={{ fontFamily: KR, fontSize: vw(25, 21), fontWeight: 500, letterSpacing: '0.01em', color: INK_100 }}>
            {label}
          </span>
          {/* 상시 밑줄(링크 신호) — 호버 시 밝아짐 */}
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              width: '100%',
              height: '1.5px',
              background: hover ? 'rgba(248,247,244,0.9)' : 'rgba(248,247,244,0.3)',
              transition: 'background 300ms ease',
            }}
          />
        </span>
        <span
          aria-hidden
          style={{
            fontFamily: MONO,
            fontSize: vw(20, 17),
            color: hover ? INK_100 : INK_55,
            transform: hover ? 'translateX(6px)' : 'translateX(0)',
            transition: 'transform 350ms cubic-bezier(0.22,1,0.36,1), color 300ms ease',
          }}
        >
          {external ? '↗' : '→'}
        </span>
      </span>
      <span style={{ display: 'block', marginTop: '10px', fontFamily: KR, fontSize: vw(13, 12), color: INK_45 }}>
        {caption}
      </span>
    </>
  )

  if (href) {
    return (
      <a
        data-reveal
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label={label}
        style={{ marginTop: '46px', display: 'block', textAlign: 'left', textDecoration: 'none', cursor: 'pointer' }}
      >
        {inner}
      </a>
    )
  }
  return (
    <button
      data-reveal
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={label}
      style={{ marginTop: '46px', display: 'block', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
    >
      {inner}
    </button>
  )
}

/* ── TypingCaption — 영상 재생 중 폰 우측에 타이핑되는 설명 ──────────────
   박스·글라스 X. 좌측 hairline + 라이트 텍스트(에디토리얼). 재생 시 한 글자씩.
   prefers-reduced-motion: 타이핑 없이 즉시 전체 표시. */
function TypingCaption({ lines, active }: { lines: string[]; active: boolean }) {
  const full = lines.join('\n')
  const [count, setCount] = useState(0)
  const [caretOn, setCaretOn] = useState(true)

  // 타이핑 진행
  useEffect(() => {
    if (!active) {
      setCount(0)
      return
    }
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setCount(full.length)
      return
    }
    let i = 0
    const id = setInterval(() => {
      i += 1
      setCount(i)
      if (i >= full.length) clearInterval(id)
    }, 42)
    return () => clearInterval(id)
  }, [active, full])

  // 커서 깜빡임
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setCaretOn((c) => !c), 500)
    return () => clearInterval(id)
  }, [active])

  const shown = full.slice(0, count)
  const done = count >= full.length

  return (
    <div
      aria-hidden={!active}
      style={{
        position: 'absolute',
        top: '50%',
        // 폰 우측 가장자리 바로 옆 (gap → spine 쪽 다크 영역)
        left: 'calc(100% + clamp(14px, 1.4vw, 30px))',
        transform: 'translateY(-50%)',
        // 각 줄을 한 줄로 유지(줄바꿈 X) → 너비는 가장 긴 줄에 맞춤
        width: 'max-content',
        maxWidth: '38vw',
        opacity: active ? 1 : 0,
        transition: 'opacity 400ms ease',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          borderLeft: '1px solid rgba(248,247,244,0.16)',
          paddingLeft: 'clamp(10px, 0.8vw, 16px)',
        }}
      >
        <span
          style={{
            display: 'block',
            fontFamily: KR,
            fontWeight: 300,
            fontSize: 'clamp(11px, 0.72vw, 13px)',
            lineHeight: 1.85,
            color: INK_80,
            whiteSpace: 'pre',
          }}
        >
          {shown}
          {!done && (
            <span style={{ opacity: caretOn ? 1 : 0, color: INK_55 }}>▍</span>
          )}
        </span>
      </div>
    </div>
  )
}

/* ── ProjectBody — 우측 단일 컬럼 (A안 위계) ────────────────────────── */
function ProjectBody({
  project,
  onStudyOpen,
}: {
  project: MobileProject
  onStudyOpen: () => void
}) {
  // 기술 메타 1줄 — platform + stack 중복 제거
  const techLine = Array.from(
    new Set([...(project.platforms ?? []), ...(project.stack ?? [])])
  ).join('  ·  ')

  return (
    <div
      style={{
        flex: 1,
        maxWidth: vw(560, 320),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* ① top 메타 — index · category · release (1줄, 강등) */}
      <div
        data-reveal
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '10px',
          fontFamily: MONO,
          fontSize: vw(13, 12),
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: INK_55,
        }}
      >
        <span style={{ color: INK_80 }}>{project.index}</span>
        <span style={{ color: INK_30 }}>—</span>
        <span>{project.category}</span>
        {project.releaseDate && (
          <>
            <span style={{ color: INK_30 }}>·</span>
            <span>{project.releaseDate}</span>
          </>
        )}
      </div>

      {/* ② 워드마크 */}
      <h2
        data-reveal
        style={{
          fontFamily: DISPLAY,
          fontSize: vw(98, 66),
          fontWeight: 400,
          lineHeight: 0.94,
          letterSpacing: '-0.03em',
          color: INK_100,
          margin: 0,
          marginTop: '26px',
          marginBottom: '30px',
          wordBreak: 'keep-all',
        }}
      >
        {project.comingSoon && (
          <span
            style={{
              fontFamily: MONO,
              fontSize: '12px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: INK_30,
              verticalAlign: 'middle',
              marginRight: '10px',
            }}
          >
            Coming Soon
          </span>
        )}
        {project.title}
      </h2>

      {/* ③ tagline */}
      <p
        data-reveal
        style={{
          fontFamily: KR,
          fontSize: vw(26, 19),
          fontWeight: 400,
          lineHeight: 1.5,
          color: INK_80,
          margin: 0,
        }}
      >
        {project.tagline}
      </p>

      {/* ④ uxIntent — hairline + 인용 */}
      {project.uxIntent && (
        <div style={{ marginTop: '42px' }} data-reveal>
          <div
            style={{ width: vw(24, 18), height: '1px', background: HAIR_STR, marginBottom: '12px' }}
            aria-hidden
          />
          <p
            style={{
              fontFamily: KR,
              fontWeight: 300,
              fontSize: vw(15, 13),
              lineHeight: 1.6,
              color: INK_60,
              margin: 0,
            }}
          >
            {project.uxIntent}
          </p>
        </div>
      )}

      {/* ⑤ 크레딧 — 1인 워크플로우 강조 + 기술 메타(강등) */}
      <div
        data-reveal
        style={{ marginTop: '46px', display: 'flex', flexDirection: 'column', gap: '8px' }}
      >
        {project.role && (
          <span
            style={{
              fontFamily: MONO,
              fontSize: vw(15, 13),
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: INK_85,
            }}
          >
            {project.role}
            {project.period ? `  ·  ${project.period}` : ''}
          </span>
        )}
        {techLine && (
          <span
            style={{
              fontFamily: MONO,
              fontSize: vw(12, 11),
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: INK_45,
            }}
          >
            {techLine}
          </span>
        )}
      </div>

      {/* ⑥ 핵심 CTA — 제작과정(studyHref) 또는 웹앱 바로가기(web) */}
      {project.studyHref ? (
        <PrimaryCta
          label="제작과정 보기"
          caption="기획 · 디자인 · 개발 전 과정 기록"
          onClick={onStudyOpen}
        />
      ) : project.downloadLinks.web ? (
        <PrimaryCta
          label="웹앱 바로가기"
          caption="출시된 서비스 둘러보기"
          href={project.downloadLinks.web}
          external
        />
      ) : null}

      {/* ⑦ try 링크 — 보조 */}
      <div
        data-reveal
        style={{ marginTop: '34px', display: 'flex', flexWrap: 'wrap', gap: '20px 28px' }}
      >
        {project.downloadLinks.playStore && (
          <ExtLink href={project.downloadLinks.playStore}>Google Play</ExtLink>
        )}
        {project.downloadLinks.appStore && (
          <ExtLink href={project.downloadLinks.appStore}>App Store</ExtLink>
        )}
        {project.studyHref && project.downloadLinks.web && (
          <ExtLink href={project.downloadLinks.web}>웹 바로가기</ExtLink>
        )}
        {project.downloadLinks.landingPage && project.downloadLinks.landingPage !== '#' && (
          <ExtLink href={project.downloadLinks.landingPage}>랜딩페이지</ExtLink>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   AppPage — 메인 export
   ══════════════════════════════════════════════════════════════════════ */
interface AppPageProps {
  project: MobileProject
  /** 0-based 페이지 인덱스 (전체 페이지 기준) */
  pageIndex: number
  /** 전체 페이지 수 */
  total: number
  /** 다음 페이지 있음 여부 */
  hasNext?: boolean
  /** 다음 페이지 콜백 */
  onNext?: () => void
}

export function AppPage({
  project,
  pageIndex,
  total,
  hasNext = false,
  onNext,
}: AppPageProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  // 영상 재생 상태 — PhoneMockup 에서 끌어올려 옆 타이핑 캡션과 동조
  const [videoPlaying, setVideoPlaying] = useState(false)

  return (
    <>
      <div
        data-page={pageIndex}
        style={{
          width: '50%',
          height: '100%',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxSizing: 'border-box',
        }}
        aria-label={`${project.title} 앱 소개`}
      >
        {/* ── 상단 spacer — Nav 자리 + 본체 수직 균형 (하단 row 와 대칭) ── */}
        <div style={{ height: 'clamp(60px, 6.5vh, 88px)', flexShrink: 0 }} aria-hidden />

        {/* ── 본체 — 좌:폰 우:정보 ─────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
          {/* 좌 페이지 — 폰 mock */}
          <div
            style={{
              width: '50%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: 'clamp(56px, 6vw, 112px)',
              paddingRight: 'clamp(32px, 3vw, 56px)',
              paddingBlock: 'clamp(80px, 8vh, 120px)',
              boxSizing: 'border-box',
              flexShrink: 0,
            }}
            data-reveal
          >
            {/* 폰 + 우측 타이핑 캡션 — 캡션은 폰 우측 가장자리 기준 절대배치(레이아웃 밀림 X) */}
            <div style={{ position: 'relative', display: 'flex', maxWidth: '100%' }}>
              <PhoneMockup
                project={project}
                maxHeight="78vh"
                dimmed={false}
                onPlayingChange={setVideoPlaying}
              />
              {project.previewVideo && project.videoCaption && (
                <TypingCaption lines={project.videoCaption} active={videoPlaying} />
              )}
            </div>
          </div>

          {/* 책등 hairline — 60vh, 수직 중앙 */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '1px',
              height: '60vh',
              background: 'rgba(248,247,244,0.08)',
              pointerEvents: 'none',
            }}
          />

          {/* 우 페이지 — 단일 컬럼 정보 */}
          <div
            style={{
              width: '50%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 'clamp(40px, 4vw, 80px)',
              paddingRight: 'clamp(56px, 6vw, 112px)',
              paddingBlock: 'clamp(80px, 8vh, 120px)',
              boxSizing: 'border-box',
              flexShrink: 0,
            }}
          >
            <ProjectBody project={project} onStudyOpen={() => setDrawerOpen(true)} />
          </div>
        </div>

        {/* ── bottom row — 화살표만 (→ 다음 페이지 / ↓ 마지막) ──────── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            paddingLeft: 'clamp(56px, 6vw, 112px)',
            paddingRight: 'clamp(56px, 6vw, 112px)',
            paddingTop: '20px',
            paddingBottom: 'clamp(32px, 3.5vh, 48px)',
            flexShrink: 0,
          }}
          data-reveal
        >
          {hasNext && onNext ? (
            <button
              onClick={onNext}
              aria-label="다음 페이지"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontFamily: MONO,
                fontSize: '20px',
                color: INK_55,
                transition: 'color 200ms ease, transform 200ms ease',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.color = INK_100
                el.style.transform = 'translateX(4px)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.color = INK_55
                el.style.transform = 'translateX(0)'
              }}
            >
              →
            </button>
          ) : (
            <span aria-hidden style={{ fontFamily: MONO, fontSize: '20px', color: INK_55 }}>
              ↓
            </span>
          )}
        </div>
      </div>

      {/* StudyDrawer — AppPage 자체 관리 */}
      {project.studyHref && (
        <StudyDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          src={project.studyHref}
          title={project.title}
        />
      )}
    </>
  )
}
