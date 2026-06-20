# Mobile Projects — 옵션 C 모션·구조 Spec

작성: 강개발 / 2026-06-20

---

## DOM 구조

translateX track 방식 채택. 이유: `absolute 겹쳐쌓기 + opacity` 는 HeroStickyExchange 의 "컬럼 고정 + 본문만 교체" 어휘에 맞지만, 가로 magazine 페이지 넘김은 *공간 이동* 어휘다. track 이 실제로 옆으로 이동하는 것을 사용자가 지각해야 "책 펼침" 감각이 생긴다. opacity-only 는 편집자 전환이지 매거진 어휘가 아니다.

```
<section data-mobile-projects-section style="height:300vh; position:relative">
  <!-- sticky wrapper: CSS sticky (GSAP pin 금지) -->
  <div data-sticky-wrapper style="position:sticky; top:0; height:100vh; overflow:hidden">

    <!-- pages track: flex row, 전체 너비 300% -->
    <div data-pages-track style="display:flex; width:300%; height:100%; will-change:transform">
      <div data-page="0" style="width:33.333%; height:100%; flex-shrink:0"> <!-- Intro Cover --> </div>
      <div data-page="1" style="width:33.333%; height:100%; flex-shrink:0"> <!-- 자린고비  --> </div>
      <div data-page="2" style="width:33.333%; height:100%; flex-shrink:0"> <!-- TripMate  --> </div>
    </div>

    <!-- 페이지 인디케이터 (sticky wrapper 내부, absolute 우하단) -->
    <div data-page-indicator style="position:absolute; right:clamp(32px,4vw,64px); bottom:clamp(28px,3.5vh,48px)">
      <div data-indicator-inner style="position:relative; overflow:hidden; height:1.4em">
        <span data-indicator-text style="display:block">01 / 03</span>
      </div>
    </div>

  </div>

  <!-- step 마커: normal-flow, sticky wrapper 바깥 (HeroStickyExchange 동일 패턴) -->
  <!-- pointer-events:none; zIndex:-1 -->
  <div data-step-marker="0" style="position:absolute; top:0;    height:100vh; width:1px; left:0" aria-hidden />
  <div data-step-marker="1" style="position:absolute; top:100vh; height:100vh; width:1px; left:0" aria-hidden />
  <div data-step-marker="2" style="position:absolute; top:200vh; height:100vh; width:1px; left:0" aria-hidden />
</section>
```

`will-change:transform` 은 track 에만. 개별 page 에는 붙이지 않는다 (GPU 레이어 중복 낭비).

---

## 컴포넌트 분리 계획

| 파일 | 역할 |
|---|---|
| `MobileProjects.tsx` | section root, ScrollTrigger setup, wheel/touch cooldown, `goTo()` 호출 |
| `IntroPage.tsx` | 매거진 표지 페이지 (page 0). 시각 상세는 강디 SPEC 수신 후 채움 |
| `AppPage.tsx` | 단일 앱 페이지 (page 1, 2 공유). `project: MobileProject` prop 받음. `PhoneMockup`, `StudyDrawer` 재사용 |
| `PageIndicator.tsx` | `currentPage: number`, `total: number` prop. 숫자 슬라이드 업/다운 |
| `PhoneMockup.tsx` | 기존 그대로. 손대지 않음 |
| `StudyDrawer.tsx` | 기존 그대로. 손대지 않음 |

**`MobileIntro.tsx` 처분: 삭제.** 260vh scrub 0.6 커튼이 Lenis 와 불안정하고, 기능적으로 About→Mobile 섹션 전환을 설명하는 역할이었으나 옵션 C 는 Intro Cover (page 0) 가 그 역할을 흡수한다. `MobileIntro` 의 "Mobile Work" 타이포 + 커튼 강하 어휘를 IntroPage 의 마운트 reveal 모션에 통합하면 섹션 수가 줄고 Lenis 위험 노드도 하나 제거된다. page.tsx 에서 `<MobileIntro />` 임포트 제거 필수.

---

## wheel cooldown + boundary 처리

HeroStickyExchange `handleWheel` 패턴 그대로 복사. 변경값만 명시.

```
COOLDOWN_MS = 900   // HeroStickyExchange 동일
MIN_DELTA   = 5     // HeroStickyExchange 동일
PAGES       = 3
```

`isPinActive()`: section `getBoundingClientRect().top <= 1 && .bottom >= innerHeight - 1`

**boundary 처리:**
- `currentPage === 0 && delta < -MIN_DELTA` → `lenis.scrollTo(sectionTop - innerHeight, { duration:0.6, force:true })`  위 섹션(About) 진입
- `currentPage === 2 && delta > MIN_DELTA`  → `lenis.scrollTo(sectionBottom + 1,         { duration:0.6, force:true })`  아래 섹션(Archive) 진입

**Lenis 차단 토글:** ScrollTrigger `onEnter/onLeave/onEnterBack/onLeaveBack` 에서 `section.setAttribute('data-lenis-prevent', '')` / `section.removeAttribute('data-lenis-prevent')`. HeroStickyExchange 와 완전 동일.

**터치:** `TOUCH_THRESHOLD = 50px`. `handleTouchStart / handleTouchMove` 패턴 동일.

**wheel 이벤트 등록:** `section.addEventListener('wheel', handleWheel, { passive: false })` — `e.preventDefault()` 호출을 위해 passive:false 필수.

---

## 페이지 전환 (translateX track)

```
goTo(nextIndex):
  gsap.to('[data-pages-track]', {
    x: `${nextIndex * -33.333}%`,
    duration: 0.85,
    ease: 'power3.inOut',
    overwrite: 'auto',
  })
```

`power3.inOut` 채택 이유: 가속→감속 대칭 커브가 책 페이지를 손으로 밀고 멈추는 물리감과 일치한다. `power2.out` 은 너무 빠르게 정착해 매거진 무게감이 없고, `elastic/back` 계열은 quiet luxury 위반.

**직전·다음 페이지 처리: 스케일/opacity 변화 적용하지 않음.** translateX 이동만 사용. 이유: `scale(0.92)` + `opacity(0.6)` 를 비활성 page div 에 적용하면 track 이 이동하는 동안 비율이 달라져 시각적으로 찌그러진다. track 전체가 하나의 단단한 평면으로 이동하는 것이 magazine spread 어휘에 더 충실하고, 모션 함정(두 요소 동시 transform 충돌)도 회피한다.

---

## 페이지 내 reveal (active 시 stagger)

page 가 `goTo()` 로 active 될 때 해당 page 내부 요소 reveal:

```
const revealPage = (pageEl: HTMLElement) => {
  const targets = pageEl.querySelectorAll('[data-reveal]')
  gsap.fromTo(
    targets,
    { y: 20, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.08,
      overwrite: 'auto',
    }
  )
}
```

비활성 전환 시 reset (재진입 대비):
```
const resetPage = (pageEl: HTMLElement) => {
  const targets = pageEl.querySelectorAll('[data-reveal]')
  gsap.set(targets, { y: 20, opacity: 0 })
}
```

`data-reveal` 어트리뷰트: 각 page 내부의 메타, 워드마크, 태그라인, PhoneMockup wrapper, CTA 에 붙임. stagger 순서는 DOM 순서(위→아래). Page 0 (Intro Cover) 는 최초 마운트 시에도 `revealPage` 1회 실행 (섹션 진입 reveal).

**함정 회피:** `gsap.set` + `gsap.fromTo` 조합. `gsap.to` 만 사용하면 초기 상태가 현재 DOM 값에서 시작해 재진입 시 y:0→0 이 되어 reveal 이 발화 안 함. `fromTo` 는 항상 y:20 에서 출발 보장.

---

## 페이지 인디케이터 슬라이드

`PageIndicator.tsx` 구현 방향:

```
// data-indicator-inner: overflow:hidden; height:1.4em (한 줄 clipping)
// data-indicator-text:  position:absolute (gsap 으로 y 이동)

// currentPage 변경 시:
gsap.to('[data-indicator-text]', {
  y: '-1.4em',            // 위로 퇴장
  opacity: 0,
  duration: 0.25,
  ease: 'power2.in',
  onComplete: () => {
    // 텍스트 교체 후
    textEl.textContent = `0${nextPage + 1} / 03`
    gsap.fromTo(textEl,
      { y: '1.4em', opacity: 0 },
      { y: '0em', opacity: 1, duration: 0.3, ease: 'power2.out' }
    )
  }
})
```

폰트: `font-mono`, `font-size: clamp(11px, 0.7vw, 13px)`, `letter-spacing: 0.18em`, `color: rgba(248,247,244,0.4)`.

---

## 데이터 모델 확장

**`lib/types/mobile-project.ts`** — 4필드 추가 (기존 필드 유지):

```typescript
export interface MobileProject {
  // ... 기존 필드 그대로 ...
  /** 제작 기간 (예: '4주') */
  period?: string
  /** 담당 역할 (예: 'Solo Design + Dev') */
  role?: string
  /** UX 의도 한 줄 (예: '절약을 게임처럼 — 점수로 동기 부여') */
  uxIntent?: string
}
```

`stack` 은 기존 `stack?: string[]` 이미 존재. 신규 추가 불필요.

**`data/mobile-projects.ts`** — placeholder 값 추가:

```typescript
// 자린고비
{
  id: 'jaringobi',
  // ... 기존 ...
  period: '4주',
  role: 'Solo Design + Dev',
  uxIntent: '절약을 게임처럼 — 점수로 동기 부여',
  stack: ['Android', 'Java'],
}

// TripMate
{
  id: 'tripmate',
  // ... 기존 ...
  period: '6주',
  role: 'Solo Design + Dev',
  uxIntent: '여행 동행 매칭의 첫 마찰 줄이기',
  stack: ['Expo', 'React Native', 'Expo Router'],
}
```

---

## 기존 MobileIntro.tsx 처분

**삭제.** scrub:0.6 사용 → Lenis 충돌 위험 노드. IntroPage (page 0) 가 "MOBILE / WORK" 슬레이트 기능 흡수. 커튼 강하 시퀀스는 IntroPage reveal 모션으로 대체. 삭제 시 `page.tsx` (또는 `sections/index.ts`) 에서 `MobileIntro` 임포트·렌더 제거 필수.

---

## CEO 결정 필요 항목

1. **Intro Cover (page 0) 비주얼 방향** — "MOBILE / WORK" 슬레이트 그대로 재현? 또는 완전히 새로운 매거진 표지 디자인? (강디 SPEC 대기)
2. **자린고비·TripMate `period`, `role`, `uxIntent`** — placeholder 입력 완료. 정확한 값 확인 후 교체 요청.
3. **IntroPage 배경 색** — 다크(#0a0a0a) 유지? 또는 라이트 시작 후 진입 시 다크 전환?
4. **섹션 전체 높이** — 300vh (3페이지 × 100vh) 고정. 이후 페이지 추가 시 공식: `pages.length × 100vh`.
5. **AppPage 레이아웃** — 기존 `AppSection` (메타 레일 + 본문 + 폰 3컬럼) 재사용? 또는 강디가 매거진 spread 전용 레이아웃 제시?
