import { footer } from '@/data/footer'
import { SectionLabel } from '@/components/primitives/SectionLabel'

/**
 * Footer — 라이트 배경, 신입 친화 구조.
 *
 *   [상단] Status line (구직 상태)
 *   [중간] Contact 라벨 + 이메일 (display-M)
 *   [강조] Resume PDF (메인 CTA)
 *   [보조] GitHub / Notion
 *   [하단] 저작권 + 위치
 *
 * 모션 없음 — Phase 3에서 진입 reveal stagger 추가 예정.
 */
export function Footer() {
  return (
    <section
      id="contact"
      className="bg-canvas text-ink-primary relative flex min-h-screen-dvh flex-col justify-between px-side-m py-[12vh] md:px-side-t xl:px-side-d"
      data-section="footer"
    >
      {/* ── 상단 영역 ── */}
      <div className="flex flex-col gap-[10vh]">
        {/* Status line */}
        <p className="font-mono text-label uppercase tracking-[0.12em] text-ink-muted">
          {footer.status}
        </p>

        {/* Contact + Email */}
        <div className="flex flex-col gap-4">
          <SectionLabel>Contact</SectionLabel>
          <a
            href={`mailto:${footer.email}`}
            className="font-display text-heading font-medium tracking-tight text-ink-primary transition-opacity hover:opacity-60"
            data-email
          >
            {footer.email}
          </a>
        </div>

        {/* Resume PDF — 강조 행 */}
        <div className="flex flex-col gap-3">
          <div className="h-px w-full bg-ink-primary/15" />
          <a
            href={footer.resume.url}
            className="group flex items-baseline justify-between font-display text-heading font-medium tracking-tight text-ink-primary"
            download
            data-resume
          >
            <span>{footer.resume.label}</span>
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-2"
            >
              →
            </span>
          </a>
          <div className="h-px w-full bg-ink-primary/15" />
        </div>

        {/* 보조 Links */}
        <ul className="flex flex-col gap-3" data-links>
          {footer.links.map(link => (
            <li key={link.label}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-baseline justify-between font-mono text-body-l uppercase tracking-[0.06em] text-ink-primary/80 hover:text-ink-primary"
              >
                <span>{link.label}</span>
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-2"
                >
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* ── 하단 저작권 + 위치 ── */}
      <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between">
        <p className="font-mono text-label uppercase tracking-[0.08em] text-ink-muted">
          {footer.copyright}
        </p>
        <p className="font-mono text-label uppercase tracking-[0.08em] text-ink-muted">
          {footer.location}
        </p>
      </div>
    </section>
  )
}
