import { about } from '@/data/about'
import { SectionLabel } from '@/components/primitives/SectionLabel'
import { StatementText } from './StatementText'
import { AboutIndex } from './AboutIndex'
import { WaveEdge } from './WaveEdge'

/**
 * About Me — 2단 구조 (다크 배경):
 *   [1] 진입 라벨 + 거대 영문 statement + 한글 paragraph
 *   [2] Editorial Index — 증명사진 + 4컬럼 인덱스
 */
export function About() {
  return (
    <section
      id="about"
      className="bg-dark text-ink-inverse relative"
      data-section="about"
    >
      {/* 검정 윗 경계 — 살짝 출렁이는 물결. 텍스트는 이 뒤로 내려감(기존 리빌). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[170px] md:h-[230px]"
        style={{ transform: 'translateY(calc(-100% + 1px))' }}
      >
        <WaveEdge />
      </div>

      <div
        className="flex min-h-screen-dvh flex-col px-side-m md:px-side-t xl:px-side-d"
        style={{ paddingTop: '95vh', paddingBottom: '6vh', rowGap: '4vh' }}
      >
        <SectionLabel className="self-center text-ink-inverse/70">About Me</SectionLabel>

        <StatementText text={about.statement.join(' ')} />

        <p className="max-w-[720px] font-kr text-body-l leading-relaxed text-ink-inverse/65">
          {about.body.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </p>
      </div>

      <AboutIndex />
    </section>
  )
}
