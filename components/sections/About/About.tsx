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
      {/* WaveEdge 폐기 — 출렁이는 물결 경계 제거 (사용자 요청) */}

      {/* 모바일: 상단 여백 축소(검정 빈공간 제거) / md+: 95vh (PORTFOLIO 리빌 여백) */}
      <div
        className="flex min-h-screen-dvh flex-col px-side-m md:px-side-t xl:px-side-d pt-[14vh] md:pt-[72vh]"
        style={{ paddingBottom: '6vh', rowGap: '4vh' }}
      >
        {/* 네비 ABOUT 클릭 스크롤 타깃 — 72vh 리빌 패딩을 건너뛰고 이력(스테이트먼트)부터 보이게.
            섹션 id="about" 는 ScrollProgress 용으로 유지, 네비는 이 앵커로 이동. */}
        <div id="about-bio" aria-hidden="true" style={{ height: 0 }} />
        <SectionLabel className="self-center text-ink-inverse/70">About Me</SectionLabel>

        <StatementText text={about.statement.join(' ')} />

        <p className="max-w-[720px] font-kr text-body-l leading-relaxed text-ink-inverse/85">
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
