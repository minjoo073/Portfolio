import { IntroOverlay } from '@/components/intro/IntroOverlay'
import { Hero } from '@/components/sections/Hero/Hero'
import { About } from '@/components/sections/About/About'
import { Experience } from '@/components/sections/Experience/Experience'
import { WorkIntro } from '@/components/sections/WebProjects/WorkIntro'
import { WebProjects } from '@/components/sections/WebProjects/WebProjects'
import { MobileProjects } from '@/components/sections/MobileProjects/MobileProjects'
import { MobileWorkIntro } from '@/components/sections/MobileProjects/MobileWorkIntro'
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
      {/* 3D Globe 인트로 — cubiflow.com 메커니즘. 스크롤 한 바퀴 → fade → Hero. */}
      <IntroOverlay />

      <Hero />

      {/*
        About 래퍼: position relative + z-10 + -mt-[30vh].
        Hero(z-[1]) 위에 쌓여 Hero overflow-visible 로 돌출된
        타이틀 그룹을 불투명 다크 배경으로 덮음.

        -mt-[30vh]: About 상단을 히어로 하단보다 30vh 위에서 시작.
        → About 시작 페이지 위치 = 130vh.
        → 스크롤 130vh 시점: About 상단 vp=0, PORTFOLIO 텍스트 vp≈+1.75vh.
        → About 다크 배경이 PORTFOLIO 위를 정확히 슬라이드하며 덮음.
        → "PORTFOLIO 가 About 뒤로 들어가는" 리빌 효과.
      */}
      {/* 모바일: 겹침 제거(Hero 한 화면 다 흰색). md+: 기존 -30vh 리빌 연출 유지 */}
      <div className="relative z-10">
        {/* 솔리드 블랙이 위로 슬라이드하며 타이틀을 덮음 → 검정 여백(About paddingTop)이 "쉼" → statement 등장. */}
        <About />
      </div>

      {/* Experience & Activities — About 와 Web 사이 (경험·활동 요약) */}
      <Experience />

      {/* About → Web 챕터 전환(거대 타이포 슬레이트). About 검정과 이어지며 '장 전환' 선언. */}
      <WorkIntro />

      <WebProjects />

      {/* Web → Mobile 챕터 전환 (거대 serif 슬레이트, WorkIntro 동일 패턴) */}
      <MobileWorkIntro />

      {/* Mobile Projects — Horizontal Spread (옵션 C). 자린고비 page 0, TripMate page 1 */}
      <MobileProjects />
      <ContentMarketing />
      <VisualWorks />

      <Footer />
    </>
  )
}
