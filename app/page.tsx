import { heroCategories, heroBody } from '@/data/nav'
import { BrowserFrameField } from '@/components/global/BrowserFrameField'
import { About } from '@/components/sections/About/About'
import { WebProjects } from '@/components/sections/WebProjects/WebProjects'
import { MobileProjects } from '@/components/sections/MobileProjects/MobileProjects'
import { ContentMarketing } from '@/components/sections/ContentMarketing/ContentMarketing'
import { VisualWorks } from '@/components/sections/VisualWorks/VisualWorks'
import { Footer } from '@/components/sections/Footer/Footer'

/**
 * Main page — 7섹션 구조 (옵션 C, IA Revision 2):
 *   Intro → About Me → Web Projects → Mobile Projects → Content & Marketing → Visual Works → Footer
 *
 * Philosophy 섹션은 별도 추가하지 않고, pin / scroll rhythm / reveal / layered motion 기법은
 * Web Projects · Visual Works의 인터랙션 설계에 흡수 (Phase 3).
 * Transition Scene 폐기 — Visual Works → Footer 직접 연결.
 */
export default function Home() {
  return (
    <>
      {/*
        Hero — 4단 정보 계층 (editorial 레이아웃):
          [1] Nav 3분할 (전역, layout.tsx)
          [2] 거대 좌측 타이포
          [3] 5단 카테고리 grid
          [4] 본문 paragraph (중앙 정렬)
          [5] scroll cue (하단 중앙)
      */}
      <section
        id="intro"
        className="relative h-screen-dvh overflow-hidden"
        data-section="intro"
      >
        {/* Browser Frame은 Hero 안에서만 — overflow-hidden으로 외부 노출 차단 */}
        <BrowserFrameField count={5} />

        <div className="relative flex h-full flex-col px-side-m md:px-side-t xl:px-side-d">
          {/* [2] 거대 좌측 타이포 — 상단 영역 */}
          <h1 className="font-display select-none pt-[12vh] text-display-xl font-medium tracking-tight text-ink-primary">
            PORTFOLIO
          </h1>

          {/* [3] 키워드 spread — 가로로 균등 분산 (좌→우 끝까지) */}
          <div className="mt-[3vh] border-t border-ink-primary/15 pt-3">
            <div className="flex w-full justify-between gap-4 font-mono text-label uppercase tracking-[0.06em]">
              {heroCategories.map(cat => (
                <div key={cat.top} className="flex flex-col">
                  <span className="text-ink-primary">{cat.top}</span>
                  <span className="text-ink-muted mt-0.5 self-end whitespace-nowrap">
                    {cat.bottom}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* [4] 본문 paragraph — 중앙 정렬 */}
          <p className="mt-[10vh] mx-auto max-w-[640px] text-center font-mono text-label uppercase leading-relaxed tracking-[0.08em] text-ink-primary">
            {heroBody[0]}
            <br />
            {heroBody[1]}
          </p>
        </div>

        {/* [5] scroll cue */}
        <div className="text-ink-primary absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 animate-bounce-slow">
          <span className="font-mono text-label uppercase tracking-[0.1em]">please scroll down</span>
          <svg width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden="true">
            <path
              d="M5 0V13M5 13L1 9M5 13L9 9"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="square"
            />
          </svg>
        </div>
      </section>

      <About />
      <WebProjects />
      <MobileProjects />
      <ContentMarketing />
      <VisualWorks />

      <Footer />
    </>
  )
}
