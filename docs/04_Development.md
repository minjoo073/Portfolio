# 4차 — Development Architecture (개발 구조)

> PARK MINJOO · UX/UI Designer Portfolio
> 단계 4/4 · 1~3차 통합 · **이 문서만 보면 개발 시작 가능**

---

## 0. 빠른 시작 (Quick Start)

```bash
cd /Users/qkralswn/Portfolio

# 1) Next.js 14 + TS + Tailwind + App Router 초기화
npx create-next-app@14 . \
  --typescript --tailwind --app --eslint \
  --no-src-dir --import-alias "@/*"

# 2) 핵심 의존성
pnpm add gsap@^3.13 lenis@^1.1 clsx@^2.1 tailwind-merge@^2.5

# 3) 개발 의존성
pnpm add -D @types/node@^20 prettier@^3.3 \
  prettier-plugin-tailwindcss@^0.6 sharp@^0.33

# 4) 폰트 (Google Fonts via next/font — 추가 설치 불필요)
#    - Inter (Variable, body)
#    - Inter Display 또는 대안: Instrument Sans (display)
#    - Pretendard (자가 호스팅, public/fonts/)

# 5) Pretendard 다운로드 (Variable woff2)
mkdir -p public/fonts
curl -L https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/packages/pretendard/dist/web/variable/PretendardVariable.woff2 \
  -o public/fonts/PretendardVariable.woff2

# 6) 개발 서버
pnpm dev
```

→ 이 6단계만으로 `http://localhost:3000` 빈 캔버스 확인 가능.

---

## 1. 기술 스택

### 1.1 의존성 표 (이유 포함)

| 카테고리 | 패키지 | 버전 | 이유 |
|---|---|---|---|
| 프레임워크 | `next` | ^14.2 | App Router, 이미지 최적화, Vercel 1-click 배포 |
| 언어 | `typescript` | ^5.4 | 타입 안전 (데이터 스키마와 컴포넌트 props) |
| 런타임 | `react` / `react-dom` | ^18.3 | Next.js 종속 |
| 스타일 | `tailwindcss` | ^3.4 | utility-first + 디자인 토큰을 `theme.extend`로 |
| 모션 | `gsap` | ^3.13 | ScrollTrigger·SplitText **모두 무료** (Webflow 인수 후) |
| 스무스 스크롤 | `lenis` | ^1.1 | (구 `@studio-freight/lenis`) GSAP ticker 동기화 |
| util | `clsx` + `tailwind-merge` | ^2 | className 조합 |
| 폰트 영문 | `next/font/google` | (내장) | self-host, FOIT 방지 |
| 폰트 한글 | Pretendard Variable woff2 | self-host | 가변 폰트 1파일, font-weight 트윈 가능 |
| 이미지 처리 | `sharp` | ^0.33 | next/image 빌드 최적화 (Vercel은 자동) |

> **사용 안 함**: Three.js, react-three-fiber, framer-motion, react-spring, Spline, anime.js. → 3조 (WebGL/3D 금지) 및 GSAP로 모두 대체 가능.

### 1.2 GSAP 플러그인 사용 명세

```ts
// lib/gsap/config.ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'   // 3.13부터 무료
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)
```

> **사용 안 함**: MorphSVG, DrawSVG, MotionPath, Flip, Physics2D, Observer — 3조 위반 또는 우리 시나리오에 불필요.

### 1.3 폰트 결정

| 용도 | 패밀리 | 로드 방식 |
|---|---|---|
| English display (PORTFOLIO·Project title) | **Instrument Sans** + **Instrument Serif** (display-XL은 serif 옵션) | `next/font/google` |
| English body | **Inter** (Variable, optical sizes) | `next/font/google` |
| Korean (모든 한글) | **Pretendard Variable** | self-host (`public/fonts/`) |

```ts
// app/fonts.ts
import { Inter, Instrument_Sans } from 'next/font/google'
import localFont from 'next/font/local'

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

export const display = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400','500','600'],
  variable: '--font-display',
  display: 'swap'
})

export const pretendard = localFont({
  src: '../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
  weight: '45 920'
})
```

### 1.4 사용 안 하는 것 명시

| 항목 | 이유 |
|---|---|
| Framer Motion | GSAP timeline·ScrollTrigger 1:1 동기화에 부적합 |
| react-spring | 우리 시나리오는 scroll-driven, spring 불필요 |
| Three.js / R3F | 3조 위반 |
| MDX | 현 단계는 placeholder, 콘텐츠 후속에서 도입 검토 |
| contentlayer | 동일 |
| shadcn/ui | 사이트에 UI 컴포넌트(버튼/다이얼로그) 거의 없음. 직접 만드는 게 톤에 맞음 |

---

## 2. 폴더 구조

```
/Users/qkralswn/Portfolio/
│
├── app/
│   ├── layout.tsx                # RootLayout + 전역 Providers
│   ├── page.tsx                  # / (메인 페이지)
│   ├── globals.css               # Tailwind base + CSS vars + reduced-motion
│   ├── fonts.ts                  # next/font 정의
│   ├── projects/
│   │   └── page.tsx              # /projects (Long Scroll Detail)
│   └── api/
│       └── (없음 — 정적 사이트)
│
├── components/
│   ├── global/
│   │   ├── Navigation.tsx
│   │   ├── CustomCursor.tsx
│   │   ├── SmoothScrollProvider.tsx       # Lenis
│   │   ├── ReducedMotionProvider.tsx      # context
│   │   └── BrowserFrameField.tsx          # 전역 Browser Frame 오브제
│   │
│   ├── primitives/                # 재사용 원자
│   │   ├── SectionLabel.tsx       # `(About Me)` 형태
│   │   ├── AnimatedText.tsx       # SplitText + ScrollTrigger
│   │   ├── Marquee.tsx
│   │   ├── ImageReveal.tsx        # clip-path reveal
│   │   ├── ScrollCue.tsx
│   │   └── Index.tsx              # "01 / 07" 카운터
│   │
│   ├── sections/                  # 메인 페이지 8개 섹션
│   │   ├── Intro/
│   │   │   ├── Intro.tsx
│   │   │   ├── PortfolioHeading.tsx
│   │   │   └── index.ts
│   │   ├── About/
│   │   │   ├── About.tsx
│   │   │   ├── KeywordStack.tsx
│   │   │   ├── CareerSnapshot.tsx
│   │   │   └── ToolsList.tsx
│   │   ├── WebProjects/
│   │   │   ├── WebProjects.tsx
│   │   │   └── ProjectCard.tsx
│   │   ├── MobileProjects/
│   │   │   ├── MobileProjects.tsx
│   │   │   └── MobileCard.tsx
│   │   ├── ContentMarketing/
│   │   │   ├── ContentMarketing.tsx
│   │   │   └── PaperItem.tsx
│   │   ├── VisualWorks/
│   │   │   ├── VisualWorks.tsx           # pin orchestrator
│   │   │   ├── HorizontalTrack.tsx
│   │   │   └── VisualItem.tsx
│   │   ├── Transition/
│   │   │   ├── Transition.tsx
│   │   │   └── ConvergingFrames.tsx
│   │   └── Footer/
│   │       ├── Footer.tsx
│   │       ├── ContactEmail.tsx
│   │       └── ContactLinks.tsx
│   │
│   └── projects-page/             # /projects 전용
│       ├── ProjectIndex.tsx       # 좌측 sticky 인덱스
│       ├── ProjectDetail.tsx      # 1개 프로젝트 전체
│       ├── Stage.tsx              # Intent/Research/IA/Interaction/Result 1단
│       └── NextProject.tsx
│
├── lib/
│   ├── gsap/
│   │   ├── config.ts              # plugin register, defaults
│   │   ├── tokens.ts              # duration/ease/stagger 상수
│   │   ├── timelines/
│   │   │   ├── intro.ts
│   │   │   ├── about.ts
│   │   │   ├── webProjects.ts
│   │   │   ├── mobileProjects.ts
│   │   │   ├── contentMarketing.ts
│   │   │   ├── visualWorks.ts
│   │   │   ├── transition.ts
│   │   │   ├── footer.ts
│   │   │   └── browserFrame.ts    # 전역 frame 부유 + 수렴
│   │   └── utils/
│   │       ├── createReveal.ts    # 표준 텍스트 reveal 팩토리
│   │       ├── createParallax.ts
│   │       ├── createBatch.ts     # ScrollTrigger.batch wrapper
│   │       └── splitTextSafe.ts   # SplitText cleanup helper
│   │
│   ├── hooks/
│   │   ├── useLenis.ts
│   │   ├── useGsapContext.ts      # gsap.context cleanup 래퍼
│   │   ├── useMediaQuery.ts
│   │   ├── useReducedMotion.ts
│   │   └── useScrollRefresh.ts    # 리사이즈 시 ScrollTrigger.refresh()
│   │
│   ├── utils/
│   │   ├── cn.ts                  # clsx + tailwind-merge
│   │   ├── seededRandom.ts        # paper 회전·offset 시드
│   │   └── breakpoints.ts
│   │
│   └── types/
│       ├── project.ts
│       ├── content.ts
│       └── nav.ts
│
├── data/
│   ├── about.ts                   # career, tools
│   ├── projects.ts                # web 7개 메타데이터
│   ├── mobile.ts                  # mobile 2개
│   ├── content.ts                 # paper 7장
│   ├── visualWorks.ts             # K개 비주얼
│   ├── nav.ts
│   └── footer.ts
│
├── public/
│   ├── fonts/
│   │   └── PretendardVariable.woff2
│   ├── images/
│   │   ├── projects/{01..07}/{thumbnail,detail-*}.{jpg,webp}
│   │   ├── mobile/{01..02}/...
│   │   └── visual/{01..K}/...
│   ├── resume.pdf
│   └── og-image.png
│
├── docs/                          # ← 이 폴더 (1~4차 문서)
│   ├── 01_IA.md
│   ├── 02_SectionStructure.md
│   ├── 03_Interaction.md
│   └── 04_Development.md
│
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
├── package.json
├── .prettierrc
├── .eslintrc.json
└── .gitignore
```

---

## 3. 컴포넌트 트리 (실행 시 마운트 순서)

```
<RootLayout>                                      [app/layout.tsx]
 ├── <ReducedMotionProvider>                      // context: 'reduce' | 'no-preference'
 │   └── <SmoothScrollProvider>                   // Lenis 인스턴스 + GSAP ticker 결합
 │       ├── <Navigation />                       // position: fixed
 │       ├── <BrowserFrameField count={5} />      // position: fixed, z: 5
 │       ├── <CustomCursor />                     // position: fixed, z: 9999 (portal)
 │       └── <main>{children}</main>              // 페이지 라우트
 │
 ├── (/)                                          [app/page.tsx]
 │   └── <main>
 │       ├── <Intro />
 │       │   ├── <PortfolioHeading />             // display-XL
 │       │   └── <ScrollCue />
 │       │
 │       ├── <About>
 │       │   ├── <SectionLabel>(About Me)</...>
 │       │   ├── <KeywordStack words={…} />       // CREATE/DESIGN/PUBLISH
 │       │   ├── <CareerSnapshot data={…} />
 │       │   ├── <ToolsList tools={…} />
 │       │   └── <Marquee items={tools} />        // 미세 마퀴
 │       │
 │       ├── <WebProjects projects={projects}>
 │       │   ├── <SectionLabel>(Featured Web Projects)</...>
 │       │   └── projects.map(p => <ProjectCard key={p.id} {...p} />)
 │       │
 │       ├── <MobileProjects projects={mobile}>
 │       │   ├── <SectionLabel>(Mobile Projects)</...>
 │       │   └── mobile.map((m,i) => <MobileCard key={m.id} alternate={i%2} {...m} />)
 │       │
 │       ├── <ContentMarketing items={content}>
 │       │   ├── <SectionLabel>(Content & Marketing)</...>
 │       │   ├── <Marquee items={['Launch','SNS','Vlog',…]} />
 │       │   └── items.map(c => <PaperItem key={c.id} index={c.index} {...c} />)
 │       │
 │       ├── <VisualWorks items={visualWorks}>    // pin orchestrator
 │       │   ├── <SectionLabel>(Visual Works)</...>
 │       │   ├── <HorizontalTrack>
 │       │   │   └── items.map(v => <VisualItem key={v.id} {...v} />)
 │       │   └── <ProgressBar />                   // 1px bottom fixed
 │       │
 │       ├── <Transition>
 │       │   └── <ConvergingFrames refSource={browserFrameRefs} />
 │       │
 │       └── <Footer>
 │           ├── <ContactEmail />
 │           └── <ContactLinks links={…} />
 │
 └── (/projects)                                  [app/projects/page.tsx]
     └── <main>
         ├── <ProjectIndex projects={[...projects,...mobile]} />
         └── all.map(p => (
             <ProjectDetail key={p.id} project={p}>
               <Stage label="(01) Intent">{p.intent}</Stage>
               <Stage label="(02) Research">{p.research}</Stage>
               <Stage label="(03) IA / Wireframe">{p.ia}</Stage>
               <Stage label="(04) Interaction">{p.interaction}</Stage>
               <Stage label="(05) Result">{p.result}</Stage>
               <NextProject next={…} />
             </ProjectDetail>
           ))
```

### 3.1 Server vs Client 컴포넌트

| 컴포넌트 | 종류 | 이유 |
|---|---|---|
| `RootLayout` | server | static |
| `Providers` (Smooth/Reduced) | **client** (`'use client'`) | hooks 사용 |
| `Navigation`, `CustomCursor`, `BrowserFrameField` | **client** | DOM/이벤트 |
| `SectionLabel` | server | static |
| `Intro`, `About`, `WebProjects` wrapper | server | static (자식이 client) |
| `KeywordStack`, `ProjectCard`, `PaperItem` 등 모션 컴포넌트 | **client** | GSAP useEffect |
| `app/page.tsx`, `app/projects/page.tsx` | server | static 데이터 import |

→ 데이터 import는 server에서, 모션은 client 분리 → 초기 HTML이 빠름 + 모션은 hydration 후 시작.

---

## 4. GSAP 파일 분리 구조

### 4.1 설계 원칙

1. **timeline 함수는 순수 함수** — DOM refs를 받아 GSAP context-bound timeline 반환. React 외부에서도 단위 테스트 가능.
2. **타이밍·이지는 토큰 1곳에서** — `lib/gsap/tokens.ts`. 사이트 톤 조정은 토큰 수정으로 끝.
3. **각 timeline 파일은 1섹션** — Intro·About·WebProjects·…·BrowserFrame. 8섹션 + 1전역 = 9개 timeline 파일.
4. **`gsap.context()` 로 cleanup** — React 18 Strict Mode 대응. 컴포넌트는 `useGsapContext` 훅으로 wrap.

### 4.2 `lib/gsap/config.ts`

```ts
'use client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

let registered = false
export function registerGsap () {
  if (registered) return
  gsap.registerPlugin(ScrollTrigger, SplitText)
  gsap.defaults({ ease: 'power3.out', duration: 0.8 })
  ScrollTrigger.defaults({ markers: false, invalidateOnRefresh: true })
  registered = true
}
```

### 4.3 `lib/gsap/tokens.ts`

```ts
export const DURATION = {
  enter: 0.8, enterSoft: 1.2,
  exit: 0.6, hover: 0.3, hoverBack: 0.4
} as const

export const EASE = {
  enter: 'power3.out', exit: 'power2.inOut',
  hover: 'power2.out',
  paperFall: 'power2.in', paperLand: 'power2.out'
} as const

export const STAGGER = {
  line: 0.12, word: 0.06, item: 0.08, card: 0.2
} as const

export const SCRUB = { tight: 0.5, loose: 1, true: true as const } as const
```

→ **3차 1.3절의 토큰표가 1:1로 코드화**.

### 4.4 `lib/gsap/utils/createReveal.ts` (재사용 팩토리)

```ts
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { DURATION, EASE, STAGGER, SCRUB } from '../tokens'

type Opts = {
  by?: 'lines' | 'words'
  scrub?: boolean | number
  start?: string
  end?: string
}

export function createReveal (target: Element, opts: Opts = {}) {
  const { by = 'lines', scrub = SCRUB.tight, start = 'top 85%', end = 'top 50%' } = opts
  const split = new SplitText(target, { type: by })
  const els = by === 'lines' ? split.lines : split.words

  return gsap.from(els, {
    y: 50, opacity: 0,
    clipPath: 'inset(100% 0 0 0)',
    duration: DURATION.enter,
    ease: EASE.enter,
    stagger: by === 'lines' ? STAGGER.line : STAGGER.word,
    scrollTrigger: { trigger: target, start, end, scrub }
  })
}
```

→ 8섹션 모두 텍스트 reveal은 이 함수 호출 1줄. 일관성 100%.

### 4.5 `lib/gsap/timelines/webProjects.ts` (예시)

```ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DURATION, EASE, STAGGER, SCRUB } from '../tokens'

export function webProjectsTimeline (root: HTMLElement) {
  const cards = root.querySelectorAll<HTMLElement>('[data-card]')
  const ctx = gsap.context(() => {
    // 카드별 reveal · ScrollTrigger.batch로 일괄
    ScrollTrigger.batch('[data-card]', {
      onEnter: batch => {
        batch.forEach(card => {
          const meta = card.querySelector('[data-meta]')
          const title = card.querySelector('[data-title]')
          const visual = card.querySelector('[data-visual]')

          gsap.from(meta, { y: 10, opacity: 0, stagger: STAGGER.item,
            duration: DURATION.enter, ease: EASE.enter,
            scrollTrigger: { trigger: card, start: 'top 95%' }})

          gsap.fromTo(visual,
            { clipPath: 'inset(100% 0 0 0)', scale: 1.08 },
            { clipPath: 'inset(0)', scale: 1,
              scrollTrigger: { trigger: card, start: 'top 90%', end: 'top 50%',
                scrub: SCRUB.loose }})

          gsap.from(title, {
            clipPath: 'inset(0 100% 0 0)',
            duration: DURATION.enterSoft, ease: EASE.enter,
            scrollTrigger: { trigger: card, start: 'top 75%' }})

          // exit parallax
          gsap.to(visual, { y: -30,
            scrollTrigger: { trigger: card, start: 'bottom 50%',
              end: 'bottom 0%', scrub: SCRUB.loose }})
        })
      },
      start: 'top 85%'
    })
  }, root)
  return ctx
}
```

→ N개 카드를 한 번에 처리. 새 프로젝트 추가 시 코드 무수정.

### 4.6 컴포넌트에서 timeline 사용

```tsx
'use client'
import { useRef, useEffect } from 'react'
import { registerGsap } from '@/lib/gsap/config'
import { webProjectsTimeline } from '@/lib/gsap/timelines/webProjects'

export function WebProjects ({ projects }: Props) {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    registerGsap()
    if (!root.current) return
    const ctx = webProjectsTimeline(root.current)
    return () => ctx.revert()       // Strict Mode 대응
  }, [projects.length])             // 카드 수 변경 시 재초기화
  // ...
}
```

### 4.7 BrowserFrame 전역 처리

`lib/gsap/timelines/browserFrame.ts`:
- 5개 frame ref를 받음
- 각 frame에 부유 timeline (3차 2.2절)
- 전역 ScrollTrigger: 스크롤 진행도 → 밀도(opacity·count) 컨트롤
- Transition 진입 시 → 중앙 수렴 timeline (3차 8.1절)

→ Frame은 **마운트되면 자기 인생 사는 컴포넌트** + Transition이 자기 ref를 빌려가 수렴시킴.

---

## 5. 데이터 구조

### 5.1 타입 정의 (`lib/types/`)

```ts
// lib/types/project.ts
export type ProjectType = 'web' | 'mobile'

export interface Project {
  id: string                    // 'project01', 'mobile01'
  index: string                 // '01', 'M1'
  type: ProjectType
  title: string                 // 'Project 01' (placeholder)
  date: string                  // 'Nov 2024'
  category: string              // 'UX·UI Web'
  thumbnail: string             // '/images/projects/01/thumbnail.webp'
  detailAnchor: string          // '#project01'
  // 후속 단계: 상세 콘텐츠
  intent?: string
  research?: string
  ia?: string
  interaction?: string
  result?: string
}

// lib/types/content.ts
export interface ContentItem {
  id: string
  index: number                 // 1..7
  label: string                 // 'App Launch'
}

export interface VisualItem {
  id: string
  index: number
  title: string                 // 'V01' (placeholder)
  thumbnail: string
  aspect?: '1:1' | '3:4' | '4:3' | '16:9'
}
```

### 5.2 데이터 파일 (`data/`)

```ts
// data/projects.ts
import type { Project } from '@/lib/types/project'

export const projects: Project[] = [
  { id: 'project01', index: '01', type: 'web',
    title: 'Project 01', date: 'Nov 2024', category: 'UX·UI Web',
    thumbnail: '/images/projects/01/thumbnail.webp',
    detailAnchor: '#project01' },
  { id: 'project02', index: '02', type: 'web',
    title: 'Project 02', date: 'Sep 2024', category: 'UX·UI Web',
    thumbnail: '/images/projects/02/thumbnail.webp',
    detailAnchor: '#project02' },
  // ... 03~07
]

// data/mobile.ts
export const mobile: Project[] = [
  { id: 'mobile01', index: 'M1', type: 'mobile',
    title: 'Mobile 01', date: 'Aug 2024', category: 'App Launch',
    thumbnail: '/images/mobile/01/thumbnail.webp',
    detailAnchor: '#mobile01' },
  { id: 'mobile02', index: 'M2', type: 'mobile',
    title: 'Mobile 02', date: 'Mar 2024', category: 'App Launch',
    thumbnail: '/images/mobile/02/thumbnail.webp',
    detailAnchor: '#mobile02' }
]

// data/content.ts
export const contentItems: ContentItem[] = [
  { id: 'c1', index: 1, label: 'App Launch' },
  { id: 'c2', index: 2, label: 'Google Play Published' },
  { id: 'c3', index: 3, label: 'SNS Promotion' },
  { id: 'c4', index: 4, label: 'Reels Content' },
  { id: 'c5', index: 5, label: 'Personal Vlog' },
  { id: 'c6', index: 6, label: 'Content Creation' },
  { id: 'c7', index: 7, label: 'Marketing Experience' }
]

// data/visualWorks.ts
export const visualWorks: VisualItem[] = [
  { id: 'v1', index: 1, title: 'V01',
    thumbnail: '/images/visual/01/thumbnail.webp', aspect: '4:3' },
  { id: 'v2', index: 2, title: 'V02',
    thumbnail: '/images/visual/02/thumbnail.webp', aspect: '4:3' },
  // ... 추가
]

// data/about.ts
export const about = {
  keywords: ['CREATE', 'DESIGN', 'PUBLISH'] as const,
  role: ['Chinese Major', 'UX/UI Designer', 'Web Publisher'],
  stats: ['3 Years Work Experience',
          '5 Countries Solo Travel',
          '2 Apps Published'],
  tools: ['Figma','Photoshop','Illustrator','HTML','CSS','JavaScript','GitHub']
} as const

// data/footer.ts
export const footer = {
  email: 'hello@parkminjoo.com',
  links: [
    { label: 'GitHub',     url: 'https://github.com/minjoo073' },
    { label: 'Notion',     url: 'https://notion.so/parkminjoo' },
    { label: 'Resume PDF', url: '/resume.pdf' }
  ]
} as const
```

→ **데이터는 코드** (typescript). 빌드 타임에 트리쉐이크. 외부 CMS 없이도 타입 안전.

---

## 6. 프로젝트 추가 방식 (3-step)

### 6.1 Web 프로젝트 1개 추가 (N=7 → 8)

```bash
# 1) 이미지 추가
mkdir -p public/images/projects/08
cp /path/to/new-thumbnail.webp public/images/projects/08/thumbnail.webp

# 2) data/projects.ts 에 객체 1개 push
```

```ts
// data/projects.ts (추가)
{ id: 'project08', index: '08', type: 'web',
  title: 'Project 08', date: 'Dec 2026', category: 'UX·UI Web',
  thumbnail: '/images/projects/08/thumbnail.webp',
  detailAnchor: '#project08' }
```

```bash
# 3) 빌드 (또는 dev 자동)
pnpm dev
```

**자동으로 일어나는 일**:
- 메인 페이지 Web Projects 섹션이 +70vh 자동 확장
- Index가 "01 / 07" → "01 / 08" 자동 갱신
- ScrollTrigger가 새 카드를 batch에 자동 추가
- `/projects` 페이지에 새 detail 섹션 자동 추가

**코드 수정 0줄.**

### 6.2 Visual Works 1개 추가 (K=5 → 6)

```bash
mkdir -p public/images/visual/06
cp /path/to/v06.webp public/images/visual/06/thumbnail.webp
```

```ts
// data/visualWorks.ts (추가)
{ id: 'v6', index: 6, title: 'V06',
  thumbnail: '/images/visual/06/thumbnail.webp', aspect: '4:3' }
```

**자동으로 일어나는 일**:
- 수평 트랙 너비 자동 재계산 (`trackWidth = K * 60vw + (K-1) * 8vw`)
- pin 종료 지점 자동 갱신 (`end: () => -trackWidth + window.innerWidth`)
- 카운터 표기 "01 / 5" → "01 / 6"
- progress bar 분모 자동 갱신

### 6.3 Content & Marketing 항목 추가

```ts
// data/content.ts
{ id: 'c8', index: 8, label: 'Newsletter' }   // 1줄 추가
```

- paper 8장 자동 배치 (trigger 지점이 7개 분배 → 8개 분배로 재계산)
- 회전·offset도 index 기반 시드 함수가 자동 계산

### 6.4 후속 단계: MDX 도입 (선택)

콘텐츠가 placeholder를 넘어 본격 작성될 때:

```bash
pnpm add @next/mdx @mdx-js/loader @mdx-js/react
```

`/content/projects/01.mdx` 형태로 frontmatter + 본문 작성 → `data/projects.ts`는 자동 생성 스크립트로 대체. **현 단계에선 불필요.**

---

## 7. 반응형 전략

### 7.1 Breakpoints (Tailwind `tailwind.config.ts`)

```ts
screens: {
  sm: '640px',
  md: '768px',     // Tablet 시작
  lg: '1024px',
  xl: '1280px',    // Desktop 시작
  '2xl': '1536px'
}
```

### 7.2 디자인 철학: **Desktop-first 설계, Mobile-first CSS**

- 디자인은 1440px 기준 (참고 사이트 RayRayLab과 동일)
- CSS는 Tailwind 기본 mobile-first: 작은 화면 default → `md:`/`lg:` 로 확장
- 이유: 인터랙션이 mouse·scroll-driven → Desktop이 메인 경험, Mobile은 의도된 폴백

### 7.3 디바이스별 폴백 매트릭스

| 기능 | Desktop (≥1280) | Tablet (768–1279) | Mobile (≤767) |
|---|---|---|---|
| Custom Cursor | 활성 | 활성 (선택) | **비활성** (touch) |
| Browser Frame field | 5개 | 3개 | **1~2개** |
| Browser Frame backdrop-filter | blur(20px) | blur(16px) | **blur(12px)** (GPU 절약) |
| Visual Works 수평 pin | 활성 | 활성 | **수직 스택 폴백** |
| Lenis smoothWheel | true | true | **false** (네이티브 터치 우선) |
| About 키워드 분해 | 활성 | 활성 | **단순 정렬 등장** |
| Browser Frame 부유 timeline | 활성 | 활성 | **정지** (배치만 유지) |
| `mix-blend-mode: difference` (Nav) | 활성 | 활성 | 활성 |

### 7.4 `useMediaQuery` 훅 — 분기 처리

```ts
// lib/hooks/useMediaQuery.ts
'use client'
import { useEffect, useState } from 'react'
export function useMediaQuery (q: string) {
  const [match, set] = useState(false)
  useEffect(() => {
    const m = window.matchMedia(q)
    set(m.matches)
    const h = (e: MediaQueryListEvent) => set(e.matches)
    m.addEventListener('change', h)
    return () => m.removeEventListener('change', h)
  }, [q])
  return match
}
```

```tsx
const isMobile = useMediaQuery('(max-width: 767px)')
// ... useEffect 안에서 isMobile일 때 timeline 폴백 호출
```

### 7.5 ScrollTrigger 리사이즈 대응

```ts
// lib/hooks/useScrollRefresh.ts
useEffect(() => {
  let timer: number
  const onResize = () => {
    clearTimeout(timer)
    timer = window.setTimeout(() => ScrollTrigger.refresh(), 250)
  }
  window.addEventListener('resize', onResize)
  return () => { window.removeEventListener('resize', onResize); clearTimeout(timer) }
}, [])
```

→ debounce 250ms. 리사이즈 중 60회 refresh 방지.

---

## 8. 성능 최적화 전략

### 8.1 Core Web Vitals 목표

| 지표 | 목표 | 측정 |
|---|---|---|
| LCP | < 2.0s | Lighthouse mobile |
| INP | < 200ms | Web Vitals |
| CLS | < 0.05 | Layout shift 최소 (placeholder 비율 고정) |
| TBT | < 200ms | 메인 thread 차단 |
| Bundle (initial) | < 200KB gz | Lighthouse |

### 8.2 이미지

| 항목 | 방침 |
|---|---|
| 포맷 | `.webp` (또는 AVIF) — next/image 자동 변환 |
| 사이즈 | thumbnail 1600×900 / detail 2400×1600 / 모바일 800×600 |
| 로딩 | next/image `loading="lazy"` 기본, Intro 직후 보이는 첫 카드만 `priority` |
| 비율 고정 | wrapper에 aspect-ratio CSS (CLS 0) |
| sizes | `sizes="(max-width:768px) 100vw, (max-width:1280px) 80vw, 1440px"` |
| placeholder | `placeholder="blur"` + `blurDataURL` (next/image 자동) |

### 8.3 코드 분할

```ts
// VisualWorks는 메인 페이지 하단 → 동적 import
const VisualWorks = dynamic(() => import('@/components/sections/VisualWorks'), {
  ssr: false,                    // pin/horizontal은 client 전용
  loading: () => <div className="h-screen" />
})
```

- `/projects` 페이지는 라우트 분리 → 메인 번들에서 제외
- GSAP은 한 번 import하면 트리쉐이크 — ScrollTrigger·SplitText만 (gsap-bonus 모두 import 금지)

### 8.4 폰트

```ts
// app/fonts.ts (위 1.3절)
{ display: 'swap', adjustFontFallback: true }
```

- `next/font/google`은 self-host 자동 — 외부 요청 0
- Pretendard Variable woff2 1개 → preload (`<link rel="preload" as="font" crossorigin>`)
- FOIT 방지: `display: swap`

### 8.5 GSAP / Lenis 최적화

| 항목 | 방침 |
|---|---|
| GPU 가속 | `transform`, `opacity`, `filter` 만 사용 |
| `will-change` | hover 요소에만 (전역 X) |
| backdrop-filter | Browser Frame 5개 한정 (모바일 1~2개) |
| SVG filter (굴절) | 전역 1회 정의, reuse |
| ScrollTrigger.batch | 카드/paper/visual 일괄 처리 |
| Lenis raf | GSAP ticker 와 단일 라이프사이클 — 별도 raf 없음 |
| matchMedia | mobile에서 무거운 timeline 제외 |

### 8.6 측정 도구

```bash
pnpm add -D @next/bundle-analyzer @vercel/analytics
```

- `pnpm build && ANALYZE=true pnpm build` → 번들 시각화
- Vercel Analytics → Real User Monitoring
- Lighthouse CI는 PR마다 (8.7절)

---

## 9. 배포 구조

### 9.1 호스팅: Vercel

이유:
- Next.js 1st-party — `next start` 없이 edge·SSG 자동
- preview deployment 무료 (PR마다 URL)
- 이미지 최적화 자동 (Sharp)
- analytics 1-click
- Custom domain HTTPS 자동

### 9.2 환경 변수 (현 단계 거의 없음)

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# .env.production
NEXT_PUBLIC_SITE_URL=https://parkminjoo.com
```

### 9.3 `next.config.mjs`

```js
/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1536, 1920]
  },
  experimental: { optimizePackageImports: ['gsap'] }
}
```

### 9.4 Git 워크플로

```
main         ← Vercel production 자동 배포
└── feat/*   ← Vercel preview 자동 배포 (PR)
```

브랜치 전략:
- `feat/intro-section` — 섹션 단위 PR
- `feat/web-projects-cards` — 카드 reveal 구현 PR
- `chore/perf-lighthouse` — 최적화 PR

### 9.5 CI (선택, GitHub Actions)

`.github/workflows/ci.yml`:
- PR 시 `pnpm install && pnpm lint && pnpm build` 통과 검증
- Lighthouse CI (선택): mobile/desktop 각각 점수 ≥ 90 가드

### 9.6 도메인

- 임시: `parkminjoo.vercel.app`
- 본도메인: 가비아·Cloudflare 등에서 구매 → Vercel에 CNAME

### 9.7 모니터링 (선택)

- Vercel Analytics — RUM
- Sentry (필요 시) — 클라이언트 에러
- 둘 다 무료 티어로 충분

---

## 10. 구현 로드맵 (Phase별)

### Phase 1 — Foundation (1~2일)

- [ ] Next.js 14 초기화 + Tailwind config
- [ ] 디자인 토큰 (color/font/spacing) Tailwind 등록
- [ ] `lib/gsap/config.ts`, `tokens.ts`
- [ ] `SmoothScrollProvider` (Lenis + GSAP ticker)
- [ ] `ReducedMotionProvider`
- [ ] `RootLayout` + `Navigation` (정적)
- [ ] 데이터 파일 7개 골격 (placeholder 값)

**Phase 1 종료 시점**: 빈 페이지 + Lenis 동작 + 폰트 로드 확인.

### Phase 2 — 정적 섹션 (2~3일)

- [ ] 8섹션 wrapper 컴포넌트 (모션 없이 마크업·스타일만)
- [ ] `<SectionLabel>`, `<Marquee>`, `<ImageReveal>` 등 primitives
- [ ] 데이터 바인딩 (`projects.map`)
- [ ] 반응형 레이아웃 (Desktop/Tablet/Mobile)
- [ ] CLS 0 확인 (aspect-ratio 모든 visual)
- [ ] `/projects` 페이지 골격 + 인덱스 (모션 없이)

**Phase 2 종료 시점**: 스크롤하면 8섹션 다 보임. 콘텐츠 추가하면 자동 확장.

### Phase 3 — 인터랙션 (3~5일)

- [ ] `BrowserFrameField` (부유 + 굴절 SVG filter)
- [ ] `CustomCursor` 5-state
- [ ] Intro timeline (진입 시퀀스 + 이탈)
- [ ] About timeline (키워드 분해 + Career stagger)
- [ ] WebProjects timeline (`ScrollTrigger.batch`)
- [ ] MobileProjects timeline (alternate)
- [ ] ContentMarketing timeline (paper fall)
- [ ] VisualWorks pin + horizontal track
- [ ] Transition 4단 시퀀스 + Frame 수렴
- [ ] Footer timeline + Email copy
- [ ] `/projects` 좌측 인덱스 active state + Next/Back

**Phase 3 종료 시점**: 3차 문서의 모든 인터랙션 동작.

### Phase 4 — Polish & Deploy (1~2일)

- [ ] `prefers-reduced-motion` 폴백 검증
- [ ] Lighthouse mobile/desktop 각각 ≥ 90
- [ ] 이미지 placeholder blur·srcset 확인
- [ ] OG 이미지·메타데이터 (`/app/layout.tsx`)
- [ ] `robots.txt`, `sitemap.xml` (next-sitemap)
- [ ] Vercel 배포 → 도메인 연결
- [ ] Vercel Analytics 활성화

**Phase 4 종료 시점**: 프로덕션 라이브.

### 총 예상 일정 — **7~12일** (1인 풀타임 기준, 콘텐츠 작성 별도)

---

## 11. 검증 체크리스트 (Phase별 자가검증)

### Phase 1 ✅

```
□ pnpm dev 에러 없음
□ Lenis 휠 스크롤 부드러움
□ Lighthouse 빈 페이지 점수 100/100
□ 폰트 swap 동작 (FOIT 없음)
```

### Phase 2 ✅

```
□ 8섹션 모두 마크업 완료, 콘텐츠 데이터 표시
□ CLS = 0 (aspect-ratio 모든 visual)
□ Mobile 360px ~ Desktop 1920px 깨지지 않음
□ data/projects.ts 에 항목 추가 시 자동 반영
```

### Phase 3 ✅

```
□ 3차 문서 12절 밀도 점검표 모두 구현
□ ScrollTrigger 약 40개 (devtools markers 확인)
□ 60fps 유지 (Chrome Performance tab)
□ prefers-reduced-motion 시 모션 정지·콘텐츠 그대로
□ Browser Frame 굴절 효과 확인 (WebGL 없이)
```

### Phase 4 ✅

```
□ Lighthouse mobile ≥ 90 / desktop ≥ 95
□ LCP < 2.0s
□ CLS < 0.05
□ INP < 200ms
□ 메인 번들 < 200KB gz
□ Vercel preview deploy 동작
□ /resume.pdf 다운로드 동작
□ 클립보드 복사 (email) 동작
```

---

## 12. 위험 요소 & 대응

| 위험 | 발생 시점 | 대응 |
|---|---|---|
| backdrop-filter Safari 성능 저하 | Phase 3 BrowserFrame | 모바일 Safari에서 frame 1~2개로 강제 축소 + blur(12px) 클램프 |
| SplitText 다국어 이슈 | Phase 3 About 한글 텍스트 | `lineBreak: 'normal'` 옵션 + `wordSpacing` 조정 |
| Lenis + ScrollTrigger pin 동기 깨짐 | Phase 3 VisualWorks | `lenis.scrollTo` 대신 `ScrollTrigger.scrollerProxy` 사용 |
| iOS 100vh 이슈 | Phase 2 Intro | `dvh` 단위 사용 (`100dvh` fallback `100vh`) |
| ScrollTrigger refresh 비용 | Phase 3 다수 trigger | `invalidateOnRefresh: true` + resize debounce 250ms |
| placeholder 이미지 누락 | Phase 2 | next/image `onError` 폴백 SVG |

---

## 13. 4차 결과 요약

- **기술 스택**: Next.js 14 + TS + Tailwind + GSAP 3.13 (ScrollTrigger·SplitText 무료) + Lenis 1.1
- **컴포넌트 트리**: 4계층 (global → primitives → sections → page-specific), server/client 분리 명확
- **GSAP**: 토큰 1곳 · 팩토리 함수 · 섹션별 timeline 파일 분리 · gsap.context cleanup
- **데이터**: TypeScript 파일 (외부 CMS 없음) · 추가 = 객체 1개 push
- **반응형**: Desktop-first 디자인 / Mobile-first CSS · 폴백 매트릭스 정의
- **성능**: LCP < 2.0s · CLS < 0.05 · 번들 < 200KB · backdrop-filter 디바이스별 강도
- **배포**: Vercel + GitHub Actions(선택) + Vercel Analytics
- **로드맵**: 4 Phase · 총 7~12일

---

## 14. 최종 (1~4차 통합 요약)

```
[1차 IA]
   ↓ Browser Frame 미장센 · 8섹션 · 1+1페이지 · 1660vh
[2차 섹션 구조]
   ↓ 12/8/4 그리드 · clamp 타이포 · 모듈화 가변 섹션
[3차 인터랙션]
   ↓ 헌법 5조 · ScrollTrigger 40개 · WebGL 0
[4차 개발 구조]
   → Next.js + GSAP + Lenis · 7~12일 · Vercel 배포
```

— **개발 시작 준비 완료**. `pnpm dev` 부터 시작.
