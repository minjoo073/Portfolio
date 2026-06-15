import { about } from '@/data/about'
import { SectionLabel } from '@/components/primitives/SectionLabel'
import { KeywordStack } from './KeywordStack'
import { CareerSnapshot } from './CareerSnapshot'
import { ToolsList } from './ToolsList'

/**
 * About Me — 3단 viewport 구조 (다크 배경):
 *   [1] 진입 라벨 단독 — viewport 중앙에 (About Me)만
 *   [2] 거대 statement — 좌측 정렬 큰 텍스트 + 한글 paragraph
 *   [3] 키워드 스택 + Career Snapshot
 */
export function About() {
  return (
    <section
      id="about"
      className="bg-dark text-ink-inverse relative"
      data-section="about"
    >
      {/* [1] 라벨 + 거대 statement + 한글 paragraph — 상단 큰 여백 + viewport 중앙~하단 배치 */}
      <div
        className="flex h-screen-dvh flex-col px-side-m md:px-side-t xl:px-side-d"
        style={{ paddingTop: '40vh', paddingBottom: '6vh', rowGap: '4vh' }}
      >
        {/* 라벨 — statement 바로 위 중앙 */}
        <SectionLabel className="self-center text-ink-inverse/70">About Me</SectionLabel>

        {/* statement — justify spread */}
        <h2
          className="font-display text-statement font-medium uppercase text-ink-inverse"
          style={{ textAlign: 'justify', textAlignLast: 'left' }}
          data-statement
        >
          {about.statement.join(' ')}
        </h2>

        {/* 한글 paragraph — statement 아래 좌측 */}
        <p className="max-w-[720px] font-kr text-body-l leading-relaxed text-ink-inverse/65">
          {about.body.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </p>
      </div>

      {/* [3] 키워드 스택 + Career Snapshot — 좌 7 / 우 5 비대칭 */}
      <div className="grid min-h-screen-dvh grid-cols-12 gap-gutter-d px-side-m py-[12vh] md:px-side-t xl:px-side-d">
        {/* 좌 — 키워드 스택 */}
        <div className="col-span-12 md:col-span-7">
          <KeywordStack keywords={about.keywords} />
        </div>

        {/* 우 — Career Snapshot + Tools */}
        <div className="col-span-12 mt-[8vh] flex flex-col gap-14 md:col-span-5 md:mt-0">
          <CareerSnapshot role={about.role} stats={about.stats} />

          <div className="flex flex-col gap-6">
            <div className="h-px w-8 bg-ink-inverse/40" />
            <ToolsList tools={about.tools} />
          </div>
        </div>
      </div>
    </section>
  )
}
