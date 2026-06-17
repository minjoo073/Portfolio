import { about } from '@/data/about'
import { SectionLabel } from '@/components/primitives/SectionLabel'
import { StatementText } from './StatementText'
import { AboutIndex } from './AboutIndex'

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
