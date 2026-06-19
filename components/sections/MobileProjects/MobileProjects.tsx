'use client'

import { useState } from 'react'
import { PhoneMockup } from './PhoneMockup'
import { StudyDrawer } from './StudyDrawer'
import { mobileProjects } from '@/data/mobile-projects'
import type { MobileProject } from '@/lib/types/mobile-project'

/* ── vw 스케일 헬퍼 (base 1920) — HeroStickyExchange 동일 패턴 ── */
const vw = (basePx: number, minPx: number) =>
  `clamp(${minPx}px, ${((basePx / 1920) * 100).toFixed(4)}vw, ${basePx}px)`

/* ── 스택 칩 ─────────────────────────────────────────────────────── */
function StackChip({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: vw(11, 10),
        fontFamily: 'var(--font-pretendard), sans-serif',
        fontWeight: 500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'rgba(248,247,244,0.6)',
        background: 'rgba(255,255,255,0.06)',
        paddingLeft: '10px',
        paddingRight: '10px',
        height: '22px',
        borderRadius: '4px',
      }}
    >
      {label}
    </span>
  )
}

/* ── 플랫폼 배지 ─────────────────────────────────────────────────── */
function PlatformBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        fontSize: vw(11, 10),
        fontFamily: 'var(--font-mono), monospace',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'rgba(248,247,244,0.50)',
      }}
    >
      {label}
    </span>
  )
}

/* ── 외부 링크 버튼 ──────────────────────────────────────────────── */
function ExtLink({
  href,
  children,
  size = 'normal',
}: {
  href: string
  children: React.ReactNode
  size?: 'normal' | 'small'
}) {
  const fontSize = size === 'small' ? vw(12, 11) : vw(13, 12)
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontFamily: 'var(--font-mono), monospace',
        fontSize,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'rgba(248,247,244,0.55)',
        textDecoration: 'none',
        transition: 'color 300ms ease',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(248,247,244,1)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(248,247,244,0.55)'
      }}
    >
      <span>{children}</span>
      <span
        style={{
          display: 'inline-block',
          fontSize: '11px',
          transition: 'transform 300ms ease',
        }}
      >
        ↗
      </span>
    </a>
  )
}

/* ── 제작과정 버튼 ───────────────────────────────────────────────── */
function StudyCta({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        fontFamily: 'var(--font-mono), monospace',
        fontSize: vw(13, 12),
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'rgba(248,247,244,0.8)',
        transition: 'color 300ms ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.color = 'rgba(248,247,244,1)'
        const line = el.querySelector('[data-line]') as HTMLElement | null
        if (line) line.style.width = '40px'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.color = 'rgba(248,247,244,0.8)'
        const line = el.querySelector('[data-line]') as HTMLElement | null
        if (line) line.style.width = '20px'
      }}
    >
      <span
        data-line
        style={{
          display: 'block',
          width: '20px',
          height: '1px',
          background: 'currentColor',
          transition: 'width 500ms cubic-bezier(0.16,1,0.3,1)',
          flexShrink: 0,
        }}
      />
      제작과정 →
    </button>
  )
}

/* ══════════════════════════════════════════════════════════════════
   메타 레일 (세로 컬럼)
   ══════════════════════════════════════════════════════════════════ */
interface MetaRailProps {
  project: MobileProject
  railWidth: string
}

function MetaRail({ project, railWidth }: MetaRailProps) {
  const labelSize = vw(10, 9)
  const valueSize = vw(11, 10)
  const indexSize = vw(11, 10)

  return (
    <div
      style={{
        width: railWidth,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        paddingTop: '4px',
      }}
    >
      {/* 인덱스 */}
      <span
        style={{
          fontFamily: 'var(--font-mono), monospace',
          fontSize: indexSize,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(248,247,244,0.30)',
        }}
      >
        {project.index}
      </span>

      {/* 출시일 */}
      {project.releaseDate && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: labelSize,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(248,247,244,0.25)',
            }}
          >
            Released
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: valueSize,
              letterSpacing: '0.10em',
              color: 'rgba(248,247,244,0.55)',
            }}
          >
            {project.releaseDate}
          </span>
        </div>
      )}

      {/* 카테고리 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: labelSize,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(248,247,244,0.25)',
          }}
        >
          Category
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: valueSize,
            letterSpacing: '0.10em',
            color: 'rgba(248,247,244,0.55)',
          }}
        >
          {project.category}
        </span>
      </div>

      {/* 플랫폼 */}
      {project.platforms.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: labelSize,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(248,247,244,0.25)',
            }}
          >
            Platform
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {project.platforms.map((p) => (
              <PlatformBadge key={p} label={p} />
            ))}
          </div>
        </div>
      )}

      {/* 스택 칩 */}
      {project.stack && project.stack.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {project.stack.map((s) => (
            <StackChip key={s} label={s} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   ProjectBody (본문 컬럼) — 워드마크 + 카피 + CTA
   ══════════════════════════════════════════════════════════════════ */
interface ProjectBodyProps {
  project: MobileProject
  bodyWidth: string
  onStudyOpen: () => void
}

function ProjectBody({ project, bodyWidth, onStudyOpen }: ProjectBodyProps) {
  return (
    <div
      style={{
        width: bodyWidth,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '0',
      }}
    >
      {/* 워드마크 */}
      <h2
        className="font-display"
        style={{
          fontSize: vw(96, 64),
          fontWeight: 400,
          lineHeight: 0.94,
          letterSpacing: '-0.03em',
          color: '#F8F7F4',
          margin: 0,
          marginBottom: '24px',
          wordBreak: 'keep-all',
          overflowWrap: 'break-word',
        }}
        data-wordmark
      >
        {project.title}
      </h2>

      {/* 태그라인 */}
      <p
        style={{
          fontFamily: 'var(--font-pretendard), sans-serif',
          fontSize: vw(24, 17),
          fontWeight: 400,
          lineHeight: 1.55,
          color: 'rgba(248,247,244,0.60)',
          margin: 0,
          marginBottom: '40px',
        }}
      >
        {project.tagline}
      </p>

      {/* CTA 묶음 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* 주 CTA: 제작과정 */}
        {project.studyHref && <StudyCta onClick={onStudyOpen} />}

        {/* 부 CTA: Google Play */}
        {project.downloadLinks.playStore && (
          <ExtLink href={project.downloadLinks.playStore}>Google Play</ExtLink>
        )}

        {/* 부 CTA: App Store */}
        {project.downloadLinks.appStore && (
          <ExtLink href={project.downloadLinks.appStore}>App Store</ExtLink>
        )}

        {/* 웹앱 링크 */}
        {project.downloadLinks.web && (
          <ExtLink href={project.downloadLinks.web}>실사이트</ExtLink>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   AppSection — 통합 단일 컴포넌트
   mirror=false (홀수): [메타] [본문] [폰]  ← 좌→우
   mirror=true  (짝수): [폰] [본문] [메타]  ← 좌→우 (reverse)
   ══════════════════════════════════════════════════════════════════ */
interface AppSectionProps {
  project: MobileProject
  /** 섹션 인덱스 (0-based). 0=홀수=정방향, 1=짝수=mirror */
  sectionIndex: number
  onStudyOpen: () => void
}

function AppSection({
  project,
  sectionIndex,
  onStudyOpen,
}: AppSectionProps) {
  const mirror = sectionIndex % 2 !== 0

  return (
    <section
      aria-label={`${project.title} 앱 소개`}
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >

      {/* 본체 — 3컬럼 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: mirror ? 'row-reverse' : 'row',
          alignItems: 'center',
          paddingLeft: 'clamp(40px, 5vw, 96px)',
          paddingRight: 'clamp(32px, 3vw, 64px)',
          paddingBottom: '12vh',
          boxSizing: 'border-box',
          gap: `clamp(24px, 2.08vw, 40px)`,
          overflow: 'hidden',
        }}
      >
        {/* 메타 레일 */}
        <MetaRail
          project={project}
          railWidth={vw(130, 105)}
        />

        {/* 본문 */}
        <ProjectBody
          project={project}
          bodyWidth={vw(420, 300)}
          onStudyOpen={onStudyOpen}
        />

        {/* 폰 mock */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <PhoneMockup project={project} maxHeight="80vh" dimmed={false} />
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════
   MobileProjects (섹션 루트)
   ══════════════════════════════════════════════════════════════════ */
export function MobileProjects() {
  const [drawerOpenFor, setDrawerOpenFor] = useState<string | null>(null)

  const projectA = mobileProjects.find((p) => p.id === 'jaringobi')
  const projectB = mobileProjects.find((p) => p.id === 'tripmate')

  const activeProject =
    drawerOpenFor === 'jaringobi' ? projectA :
    drawerOpenFor === 'tripmate'  ? projectB :
    undefined

  return (
    <div
      id="mobile"
      className="relative bg-dark text-ink-inverse"
      data-section="mobile-projects"
    >
      {/* 섹션 0 — 자린고비 (홀수 인덱스, 폰 우측) */}
      {projectA && (
        <AppSection
          project={projectA}
          sectionIndex={0}
          onStudyOpen={() => setDrawerOpenFor('jaringobi')}
        />
      )}

      {/* 섹션 1 — TripMate (짝수 인덱스, 폰 좌측 mirror) */}
      {projectB && (
        <AppSection
          project={projectB}
          sectionIndex={1}
          onStudyOpen={() => setDrawerOpenFor('tripmate')}
        />
      )}

      {/* StudyDrawer — A/B 공유 */}
      {activeProject?.studyHref && (
        <StudyDrawer
          open={drawerOpenFor !== null}
          onClose={() => setDrawerOpenFor(null)}
          src={activeProject.studyHref}
          title={activeProject.title}
        />
      )}
    </div>
  )
}
