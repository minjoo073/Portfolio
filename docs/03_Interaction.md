# 3차 — Interaction Design (인터랙션 설계)

> PARK MINJOO · UX/UI Designer Portfolio
> 단계 3/4 · 2차 섹션 구조 기반

---

## 0. 인터랙션 헌법 (Constitution)

이 문서의 모든 명세는 다음 5조를 위반할 수 없다.

| 조 | 원칙 | 위반 시 |
|---|---|---|
| **1조** | 프로젝트가 주인공, 모션은 조연. 모든 모션은 "콘텐츠를 더 잘 읽히게 하는 이유"가 있어야 함. | 폐기 |
| **2조** | RayRayLab 수준의 인터랙션 밀도를 유지 (ScrollTrigger 30~50개, hover/scrub/pin/parallax/marquee 다 사용). 단, 각 인터랙션은 1조에 종속됨. | 폐기 |
| **3조** | WebGL · 3D · 파티클 · 물리 시뮬레이션 사용 안 함. 모든 모션은 CSS + GSAP + SVG filter 범위 내에서. **예외: Hero 타이틀(MINJOO) 한정 Three.js WebGL 허용 (CEO 승인 2026-06-17).** | 폐기 |
| **4조** | Quiet luxury · editorial · technical · premium 톤. 빠른/작은/tech-feel 인터랙션 회피. duration ≥ 600ms 기본. | 폐기 |
| **5조** | 모든 모션은 `prefers-reduced-motion: reduce` 환경에서 비활성 또는 단순화. | 폐기 |

### 0.1 "콘텐츠 보조" 정의

각 인터랙션은 다음 중 **최소 1개** 역할을 해야 함:
- (a) 콘텐츠의 **존재**를 알림 (reveal)
- (b) 콘텐츠의 **위계**를 강화함 (stagger, scale, weight 변화)
- (c) 콘텐츠 간 **관계/순서**를 설명함 (parallax 속도차, scrub 진행감)
- (d) 콘텐츠로 향하는 **시선 유도** (cursor, scroll cue)

(a)~(d) 어디에도 해당 안 되면 = 장식 = 폐기.

### 0.2 밀도 ≠ 화려함

RayRayLab의 밀도는 **"항상 무언가 미세하게 움직이는" 정적 위의 호흡감**이지 화려한 효과가 아님. 우리도 같은 방식으로 밀도 확보:
- 항상 살아있는 것 (low-density continuous): cursor lerp, marquee, scroll cue bounce, Browser Frame 미세 부유
- 스크롤 종속 (scrub): parallax, image reveal, text reveal
- 스크롤 이벤트 (one-shot): pin in/out, label fade
- 마우스 이벤트 (hover): card hover, link underline expand, cursor scale

→ **항상 0.2~0.4 단위의 미세한 움직임이 화면에 존재** → 정적이지만 죽어있지 않음.

---

## 1. 전역 시스템

### 1.1 Lenis (Smooth Scroll)

```
duration: 1.2
easing: t → Math.min(1, 1.001 - Math.pow(2, -10 * t))   // exponential
smoothWheel: true
wheelMultiplier: 1
touchMultiplier: 2
syncTouch: false
```

- **GSAP ticker와 동기화** — `lenis.on('scroll', ScrollTrigger.update)`
- 모바일은 `smoothTouch: false` (네이티브 스크롤 유지, OS 일관성 우선)

### 1.2 GSAP 글로벌 디폴트

```
gsap.defaults({ ease: 'power3.out', duration: 0.8 })
ScrollTrigger.defaults({ markers: false })
```

### 1.3 모션 토큰

| 토큰 | duration | ease | 용도 |
|---|---|---|---|
| `enter` | 800ms | `power3.out` | 요소 등장 |
| `enter-soft` | 1200ms | `power3.out` | 큰 타이포·이미지 등장 |
| `exit` | 600ms | `power2.inOut` | 요소 이탈 |
| `hover` | 300ms | `power2.out` | 마우스 진입 |
| `hover-back` | 400ms | `power2.out` | 마우스 이탈 (살짝 느리게) |
| `scrub-tight` | scrub: 0.5 | none | 텍스트 reveal |
| `scrub-loose` | scrub: 1 | none | 이미지 parallax |
| `scrub-true` | scrub: true | none | pin·marquee 등 1:1 |
| `loop-slow` | 30s linear infinite | none | marquee |
| `loop-bounce` | 2s sine inOut | — | scroll cue |

### 1.4 stagger 토큰

| 토큰 | 값 | 용도 |
|---|---|---|
| `stagger/line` | 0.12s | 줄 단위 reveal |
| `stagger/word` | 0.06s | 단어 단위 |
| `stagger/item` | 0.08s | nav, label, footer 행 |
| `stagger/card` | 0.2s | 카드 진입 |

### 1.5 ScrollTrigger 아키텍처

```
1 메인 페이지에 ScrollTrigger 약 40개 (RayRayLab 수준)
   ├── Nav: 1
   ├── Intro: 3   (Frame 부유 · PORTFOLIO 등장/이탈 · scroll cue)
   ├── About: 5   (label · 키워드 stack→정렬 · career stagger · 구분선 · tool stagger)
   ├── Web Projects: 1 + N × 4   (label + 카드별 meta·title·image·exit)
   ├── Mobile Projects: 1 + M × 3
   ├── Content & Marketing: 1 + 7 (paper별 1개)
   ├── Visual Works: 1 pin + K × 2 (item reveal + counter)
   ├── Transition: 4 (fade·frame수렴·PORTFOLIO·4줄 시퀀스)
   └── Footer: 1

2 모든 ScrollTrigger는 `invalidateOnRefresh: true` — 리사이즈 대응
3 `ScrollTrigger.batch()` 사용 — 같은 패턴(카드들) 일괄 처리로 성능 확보
4 `gsap.context()` 로 React useEffect 안에서 cleanup 안전 처리
```

---

## 2. SECTION 00 — Intro 인터랙션

### 2.1 진입 시퀀스 (0~1500ms, 페이지 로드 직후)

| t (ms) | 요소 | 모션 | 토큰 |
|---|---|---|---|
| 0 | (대기) | 빈 캔버스 | — |
| 200 | PORTFOLIO 타이포 | opacity 0→1 · blur(12px)→0 · scale 0.96→1 | `enter-soft` |
| 500 | Nav 좌·우 | y -20→0 · opacity 0→1 · stagger `item` | `enter` |
| 1100 | Browser Frame ×3~5 | opacity 0→1 · y +40→0 · 각 frame `stagger/card` | `enter-soft` |
| 1400 | scroll cue | opacity 0→1 · y 10→0 | `enter` |
| 1500+ | scroll cue | y 0→8→0 무한 | `loop-bounce` |

**왜**: PORTFOLIO가 가장 먼저, 가장 느리게 등장 (1조 — 콘텐츠 우선). Frame은 1초 뒤에 살그머니 합류 (장식이지 주인공 아님).

### 2.2 Browser Frame 굴절 (상시, 1500ms 이후)

**핵심 구현 — WebGL 없이 굴절 효과**:

```
Frame element {
  position: absolute;
  width/height: 240×180 ~ 480×320 (3종)
  background: rgba(255,255,255,0.06)
  backdrop-filter: blur(20px) saturate(140%)
  border: 1px solid rgba(255,255,255,0.18)
  border-radius: 12px
  filter: url(#refraction-svg)   ← 미세 displacement SVG filter
}

<svg width=0 height=0>
  <filter id="refraction-svg">
    <feTurbulence baseFrequency="0.012" numOctaves="2" seed="3"/>
    <feDisplacementMap in="SourceGraphic" scale="3"/>
  </filter>
</svg>
```

- `backdrop-filter`가 PORTFOLIO 텍스트 위 영역을 굴절 → **콘텐츠를 더 잘 보이게 함이 아니라 미장센 (4조 quiet luxury)**
- `feDisplacementMap scale: 3` 은 매우 미세 (px 단위 흔들림)
- WebGL이 아님 (3조 OK)

**Frame 부유 모션 (GSAP timeline, 1500ms 이후)**:

| Frame | 모션 (각자 다른 위상으로 무한 반복) |
|---|---|
| #1 | x ±30px (8s sine inOut) + y ±20px (6.5s) + rotate ±2° (10s) |
| #2 | x ±40px (9s) + y ±15px (7s) + rotate ±3° (11s) |
| #3 | x ±25px (7s) + y ±35px (8.5s) + rotate ±1.5° (9s) |
| #4 | (랜덤 위상) |
| #5 | (랜덤 위상) |

→ 5개 frame이 **각자 다른 주기로 움직여 절대 동기화되지 않음** → 자연스러운 부유.

**왜**: 항상 움직이는 미세 모션 = RayRayLab의 "RAY 글리치"와 동일한 역할 (밀도 확보).

### 2.3 Intro 이탈 (스크롤 0~100vh)

| 요소 | scrub | 값 |
|---|---|---|
| PORTFOLIO | `scrub-loose` | y 0→-120 · opacity 1→0 (50vh에서 0) |
| Frames | `scrub-loose` | y 0→-80 · opacity 1→0.2 (Frame은 완전히 안 사라짐 — About에 1~2개 잔향) |
| scroll cue | `scrub-tight` | opacity 1→0 (20vh에서 0) |

---

## 3. SECTION 01 — About Me 인터랙션 (180vh)

### 3.1 스크롤 시나리오

| 스크롤 | 좌측 키워드 (CREATE/DESIGN/PUBLISH) | 우측 Career Snapshot |
|---|---|---|
| 0–10% | label `(About Me)` y 15→0 · opacity 0→1 (`enter`) | — |
| 10–30% | 3 키워드 **겹친 상태로 동시 등장** (translate 0, mix-blend-mode: multiply) · scale 0.98→1 · `enter-soft` | "Chinese Major" reveal |
| 30–55% | 키워드 **분해 정렬** — CREATE y 0 / DESIGN y +120 / PUBLISH y +240 — `scrub-tight` 로 스크롤에 맞춰 천천히 벌어짐 | "UX/UI Designer", "Web Publisher" `stagger/line` |
| 55–75% | (유지) | 구분선 width 0→32px (`enter`) · 3 lines stagger `stagger/line` |
| 75–95% | 키워드 살짝 y -40 · opacity 1→0.4 (`scrub-loose`) | Tool 배열 8개 `stagger/item` |
| 95–100% | 키워드 y -80 · opacity 0 (`scrub-loose`) | y -30 · opacity 1→0 |

### 3.2 키워드 분해의 "왜"

- **겹쳤다가 분해** = "내 역할은 3개이고, 그것은 동시에 작동한다"는 메타포
- 단순 등장보다 더 많은 시선 시간을 확보 (콘텐츠 위계 강화 — 0.1조 (b))
- mix-blend-multiply로 겹친 부분이 어두워짐 → **두께 변화로 위계 자연 발생**

### 3.3 호버 — Tools 배열

| 도구 라벨 hover | 효과 |
|---|---|
| mouseenter | x 0→4px · weight regular→medium (`hover`, font-variation-settings 트윈) |
| mouseleave | 역방향 (`hover-back`) |

→ 미세 (4px) — 화려하지 않지만 **인터랙티브함을 알림** (0.1조 (d) 시선 유도)

---

## 4. SECTION 02 — Web Projects 인터랙션 (가변)

### 4.1 섹션 label (스크롤 진입)

| 트리거 | 모션 |
|---|---|
| section top 90% | `(Featured Web Projects)` y 15→0 · opacity 0→1 (`enter`) |
| section bottom 30% | 이탈 시 opacity 1→0 (`scrub-loose`) |

### 4.2 카드 reveal (per card, ScrollTrigger.batch로 일괄)

| 트리거 | 요소 | 모션 |
|---|---|---|
| card top 95% | meta (date·category) | y 10→0 · opacity 0→1 · `stagger/item` (date → category) |
| card top 90% | index "01 / 07" | opacity 0→0.6 (`enter`) |
| card top 90% → top 50% | visual placeholder | `clip-path: inset(100% 0 0 0) → inset(0)` · scale 1.08→1 · `scrub-loose` |
| card top 75% | title `PROJECT 01` | `clip-path: inset(0 100% 0 0) → inset(0)` (L→R) · `enter-soft` |

### 4.3 카드 이탈 (parallax)

| 스크롤 | 요소 | 모션 |
|---|---|---|
| card bottom 50% → bottom 0% | visual | y 0 → -30px · `scrub-loose` |
| 동일 | title | y 0 → -20px · opacity 1 → 0.6 · `scrub-loose` |

→ **다음 카드가 들어오기 전에 이전 카드가 미세하게 위로 빠짐** = 카드 간 순서 강화 (0.1조 (c)).

### 4.4 카드 호버 (마우스)

| 요소 | mouseenter | mouseleave |
|---|---|---|
| visual | scale 1 → 1.02 · filter brightness 1 → 1.04 (`hover`) | 역방향 (`hover-back`) |
| title | x 0 → 12px (`hover`) | x 12 → 0 (`hover-back`) |
| meta | opacity 0.6 → 1 (`hover`) | 역방향 |
| custom cursor | 12px → 48px · 내부 "View" 라벨 fade in (`hover`) | 역방향 |

**왜**: hover는 "클릭 가능"의 신호. 4가지 요소가 미세하게 동시에 반응 → 카드 전체가 살아있음을 알림 (0.1조 (d)).

### 4.5 카드 클릭 → 페이지 전환

| 단계 | 시간 | 모션 |
|---|---|---|
| 클릭 | 0ms | cursor scale 48 → 12 (`hover-back`) |
| 0–200ms | viewport 전체에 `bg/canvas` 오버레이 opacity 0 → 1 | `enter` |
| 200ms | `/projects#projectN` 으로 navigate | — |
| 도착 직후 | 오버레이 opacity 1 → 0, 200ms | `enter` |

→ **드라마틱하지 않은 전환** (4조). 흰 페이드만, 0.4초.

### 4.6 ScrollTrigger.batch 사용 이유

```
ScrollTrigger.batch('.project-card', {
  onEnter: batch => gsap.from(batch, { y: 30, opacity: 0, stagger: 0.2 }),
  start: 'top 85%'
})
```

→ N=20 으로 늘어도 batch 하나로 처리. 성능·코드 둘 다 모듈화.

---

## 5. SECTION 03 — Mobile Projects 인터랙션 (가변)

### 5.1 진입

| 트리거 | 요소 | 모션 |
|---|---|---|
| section top 90% | label `(Mobile Projects)` | `enter` |

### 5.2 카드 reveal (alternate 패턴)

홀수 카드 (mock 좌측):

| 요소 | 모션 |
|---|---|
| device mock | x -40 → 0 · opacity 0 → 1 · `scrub-loose` (카드 90%~60%) |
| title block | x +40 → 0 · opacity 0 → 1 · `scrub-loose` (살짝 늦게, delay 0.15s) |

짝수 카드 (mock 우측): x 부호 반전.

→ **카드마다 시선이 좌→우 또는 우→좌로 교차** = 단조로움 방지 (0.1조 (c)).

### 5.3 디바이스 mock 호버

| mouseenter | scale 1 → 1.015 · y 0 → -4px (`hover`) — 살짝 들림 |
| mouseleave | 역방향 (`hover-back`) |

→ device가 "잡힐 듯" 들리는 미세 모션. 화려하지 않음.

### 5.4 View Detail 화살표 호버

| mouseenter | 화살표 너비 8 → 16px (`hover`) · 라벨 weight medium → semibold |
| mouseleave | 역방향 |

---

## 6. SECTION 04 — Content & Marketing 인터랙션 (200vh)

### 6.1 종이 펄럭 시나리오 (핵심 모션)

각 paper(총 7장)는 자기 trigger 지점에서 다음 시퀀스 수행:

| t (ms) | 단계 | 변화 |
|---|---|---|
| 0 | 진입 직전 | y -80vh · opacity 0 · rotate (랜덤 ±6°) · scale 0.96 |
| 0–500 | **떨어짐** | y -80vh → 0 · ease `power2.in` (중력 가속) |
| 500–700 | **펄럭 1** | rotate (target) → (target -3°) · 200ms ease `sine.inOut` |
| 700–900 | **펄럭 2** | rotate (target -3°) → (target +2°) · 200ms ease `sine.inOut` |
| 900–1100 | **착지** | rotate → (target) · ease `power2.out` · scale 0.96 → 1 · y 살짝 bounce (-4px → 0) |
| 1100+ | 정착 | (유지) |

- 떨어지는 동안 **그림자 size 작음 → 큼** (착지 가까워질수록 그림자 짙고 넓어짐) — y와 box-shadow 동기화
- 모든 paper rotate target은 **index 기반 시드 함수** — 매번 같은 위치/회전

### 6.2 trigger 분배

- paper 7장의 trigger 지점을 200vh 안에 균등 분배:
  - paper 1: section top 80%
  - paper 2: section top 70%
  - paper 3: section top 60%
  - ...
  - paper 7: section top 20%
- 사용자가 스크롤 = paper 1장씩 떨어짐 = **시간 순서로 경험을 쌓아가는 메타포**

### 6.3 paper 호버

| mouseenter | y 0 → -8px · rotate (target) → 0 (살짝 평평해짐) · `hover` |
| mouseleave | 역방향 (`hover-back`) |

→ **종이를 들춰보는 듯한 미세 인터랙션**. 클릭 가능 신호이지만 어디로 가지는 않음 (현재 단계는 정적, 후속 단계에서 detail 연결 검토).

### 6.4 섹션 라벨 + 마퀴 (선택적 — 밀도 보강)

RayRayLab Identity의 "BRAND" 마퀴 패턴 차용:

- 섹션 진입 직후 화면 상단에 `Content · Marketing · Launch · SNS · Vlog ·` 무한 마퀴 (`loop-slow`, 우→좌)
- 폰트 80px outline only (속이 빈 글자) — paper와 시각 충돌 안 함
- 스크롤 진행에 따라 마퀴 자체에 `scrub-loose` 로 x 추가 이동 → 스크롤하면 더 빨라짐

→ "Content & Marketing"이라는 라벨링을 **시간 위에 분산** = 위계 강화 (0.1조 (b)).

---

## 7. SECTION 05 — Visual Works 인터랙션 (가변, 수평)

### 7.1 pin + 수평 트랙

```
ScrollTrigger.create({
  trigger: '#visual-works',
  start: 'top top',
  end: () => `+=${trackWidth - window.innerWidth}`,   // 동적
  pin: true,
  scrub: true,
  anticipatePin: 1
})

gsap.to('#visual-track', {
  x: () => -(trackWidth - window.innerWidth),
  ease: 'none',
  scrollTrigger: (위와 동일 트리거)
})
```

- K=5 → trackWidth ≈ 290vw → pin 구간 ≈ 190vw (수직 환산 약 190vh, 그러나 메인 스크롤 카운트는 300vh)
- **K 변경 시 자동 재계산** (`end: () => ...` 함수)

### 7.2 item reveal (수평 트랙 안에서 ScrollTrigger horizontal)

각 item이 viewport 중앙을 통과할 때:

| 트리거 | 요소 | 모션 |
|---|---|---|
| item 우측이 viewport 우 80% 진입 | visual placeholder | `clip-path: inset(0 0 0 100%) → inset(0)` (R→L) · `scrub-loose` |
| 동일 | item title | y 20 → 0 · opacity 0 → 1 (`scrub-tight`) |
| item이 viewport 중앙 통과 | counter "0N / K" | 숫자 카운터 증가 (mid-point에서 += 1) |

### 7.3 item 호버

| mouseenter | scale 1 → 1.02 · 인접 item에 mask opacity 0 → 0.4 (인접만 살짝 어둠) (`hover`) |
| mouseleave | 역방향 |

→ **현재 보고 있는 작품만 강조**, 옆은 흐려짐 = 시선 유도 (0.1조 (d)).

### 7.4 수평 진행 표시

- 섹션 하단 fixed bar — `width: scrollProgress * 100%` (`scrub-true`)
- 1px 두께, `ink/muted`
- 시선 방해 없는 가는 진행감 (4조 quiet)

### 7.5 모바일 폴백

- pin 해제, 수직 스택
- 각 item이 viewport 진입 시 `enter-soft` 로 등장
- 수평 모션 0 → **하지만 reveal 패턴은 유지** = 일관성

---

## 8. SECTION 06 — Transition Scene 인터랙션 (150vh)

### 8.1 4단 시퀀스 (상세 timeline)

| 스크롤 | 단계 | 모션 |
|---|---|---|
| 0–20% | **암전** | bg `canvas` → `dark` · `scrub-loose` · Visual Works의 잔여 frame들이 viewport 외곽으로 흩어지지 않고 그 자리 유지 |
| 20–40% | **Frame 수렴** | 메인 페이지의 마지막에 있던 Frame들(잔향)이 각자의 위치에서 **viewport 중앙 한 점**으로 — x/y/rotate → 중앙 · scale → 1.4 · 4개 frame이 동시 스택 · `scrub-tight` |
| 40–55% | **PORTFOLIO 등장** | Frame 4장이 겹쳐진 자리에 PORTFOLIO 타이포 reveal — `clip-path: inset(0 50% 0 50%) → inset(0)` (중앙→양옆) · `scrub-tight` · Frame은 opacity 1 → 0 동시 진행 (PORTFOLIO에 자리 양보) |
| 55–87% | **4줄 시퀀스** | PORTFOLIO 유지 + 아래로 3줄 순차 등장 — `PARK MINJOO` → `UX·UI DESIGNER` → `CONTACT` · 각 줄 `enter-soft` · stagger 0.25s (느리게) |
| 87–100% | **Footer 연결** | bg `dark` → `canvas` (`scrub-loose`) · 4줄 모두 y 0 → -100 · opacity 1 → 0 (`scrub-loose`) |

### 8.2 Frame 수렴의 "왜"

- Intro에서 떠다니던 frame들이 **여기서 회수됨** = 사이트 전체를 닫는 서사 장치 (1차 IA 6번)
- 사용자가 **"아, 처음의 그것들"** 인식 → 콘텐츠 전체 흐름 강화 (0.1조 (b) 위계)
- 수렴 거리·rotate는 frame별로 다름 — 동시에 도착하지만 경로가 다름 (밀도)

### 8.3 CONTACT 호버

CONTACT 줄에 마우스 올리면:

| mouseenter | underline width 0 → 100% · `hover` (300ms) · cursor scale → 60px |
| 클릭 | Footer로 부드러운 anchor scroll (Lenis) |

→ 마지막 시퀀스에서 **유일한 인터랙티브 요소** = 시선 유도 자연 발생.

---

## 9. SECTION 07 — Footer 인터랙션 (100vh)

### 9.1 진입

| 트리거 | 요소 | 모션 |
|---|---|---|
| section top 70% | Contact label | `enter` |
| 동일 | Email 큰 타이포 | y 30 → 0 · `enter-soft` · delay 0.1s |
| section top 60% | 구분선 | width 0 → 32px (`enter`) |
| 동일 | Link 3행 | `stagger/item` y 20 → 0 |
| section top 40% | 두 번째 구분선 + Copyright | `enter` |

### 9.2 Email 호버

- mouseenter: `underline width 0 → 100%` (`hover`) · cursor → "copy" 아이콘으로 변환
- click: 클립보드 복사 + 작은 toast "copied" 1.5s

→ **실용적 인터랙션** (1조 — 기능이 명확).

### 9.3 Link 호버 (GitHub / Notion / Resume)

- mouseenter: → 화살표 8 → 24px · 라벨 weight medium → semibold · URL underline 등장 (`hover`)
- mouseleave: 역방향 (`hover-back`)

---

## 10. 글로벌 인터랙션

### 10.1 Custom Cursor 상태 머신

```
state: default | hover-card | hover-link | copy | view-disabled
```

| state | size | content | mix-blend | 트리거 |
|---|---|---|---|---|
| default | 12px circle | — | difference | 기본 |
| hover-card | 48px circle | "View" label | difference | `.project-card`, `.mobile-card`, `.visual-item` |
| hover-link | 18px circle | — | difference | `a`, `button` |
| copy | 48px circle | "Copy" label | difference | Footer Email |
| view-disabled | 24px circle (border-only) | — | difference | hover `.no-action` (예: placeholder) |

**Lerp factor 0.15** — 마우스보다 살짝 느리게 따라옴 (4조 quiet, 5조 reduced-motion 시 lerp 1 = 즉시 따라옴).

### 10.2 Navigation 동작

- **상시 fixed** · 배경 없음
- 스크롤 200vh 이후 — `mix-blend-mode: difference` 또는 색상 토큰 자동 전환 (Visual Works 어두운 항목, Transition dark 구간에서 가독성 확보)
- Nav 링크 hover: underline width 0 → 100% (`hover`)
- WORK 클릭 → Web Projects 섹션으로 Lenis anchor scroll (1.5s)
- CONTACT 클릭 → Footer로 Lenis anchor scroll

### 10.3 페이지 전환 (메인 ↔ /projects)

| 방향 | 모션 |
|---|---|
| 메인 → /projects#N | (4.5절 참조) 200ms 흰 페이드 |
| /projects → 메인 | 동일 인버스 |
| /projects 안에서 인덱스 클릭 | Lenis로 부드러운 anchor scroll (1.5s) |

### 10.4 마퀴 (Content&Marketing 외 1곳 추가 검토)

About Me의 우측 Tool 배열 영역 하단에 작은 마퀴 — `Figma · Photoshop · Illustrator · HTML · CSS · JS · GitHub` 무한 (loop-slow, 좌→우, 14px label outline only).

→ "내가 다루는 도구"의 **상시 존재감** + RayRayLab 밀도 차용 (2조).

---

## 11. /projects (Long Scroll Page) 인터랙션

### 11.1 좌측 sticky 인덱스

- 항상 sticky (Desktop) / 상단 가로 (Mobile)
- 현재 viewport에 진입한 프로젝트 번호가 **active 상태로 자동 전환** (ScrollTrigger 9개 — 각 프로젝트마다 1개)
- active: `ink/muted 40%` → `ink/primary` · weight regular → semibold (`hover` 동일 토큰)
- 인덱스 항목 클릭: Lenis anchor scroll (1.5s)

### 11.2 프로젝트 내부 5단 (Intent / Research / IA / Interaction / Result)

각 단의 시작에:

| 트리거 | 요소 | 모션 |
|---|---|---|
| 단 top 85% | `(01) Intent` 라벨 | `enter` |
| 단 top 80% | 단의 첫 콘텐츠 (heading 또는 image) | `enter-soft` |
| 단 top 75% | 단의 본문 단락 | line stagger `stagger/line` `scrub-tight` |
| 단 top 75% (image 있을 때) | image | clip-path reveal · `scrub-loose` |

→ Web Projects 카드 reveal과 **동일 패턴 재사용** = 사이트 전체에 일관성 (4조 premium).

### 11.3 Next: Project N+1 →

- 각 프로젝트 끝에 위치
- hover: → 화살표 8 → 24px (`hover`)
- 클릭 시 다음 프로젝트 앵커로 Lenis scroll (1.5s)

### 11.4 Back to Main ↑

- 마지막 Mobile 02 끝
- 클릭 시 `/` (Transition 직전 viewport top으로) — 짧은 흰 페이드 200ms

---

## 12. 인터랙션 밀도 점검표 (RayRayLab vs Ours)

| 항목 | RayRayLab | Ours | 위반? |
|---|---|---|---|
| Lenis smooth scroll | ✓ | ✓ | — |
| Custom cursor 4-state | ✓ | ✓ (5-state) | — |
| Pin (sticky text) | 1곳 | 1곳 (Visual Works) | — |
| Parallax | 2곳 | 4곳 (Web cards × 7개 모두, Mobile, Content marquee, Visual progress) | — |
| Marquee | 1곳 | 2곳 (About Tools, Content&Marketing) | — |
| Hover (card) | 1패턴 | 3패턴 (Web/Mobile/Visual 각자) | — |
| Image reveal (clip-path) | 7개 | 7+9+K = 21+ | — |
| Text reveal (split) | ~10곳 | ~15곳 (About 키워드, label들, project titles, transition 4줄, footer Email) | — |
| Infinite micro (bounce·glitch) | 1 (RAY glitch) | 5+1 (Browser Frame ×5 + scroll cue) | — |
| Page transition | 추정 1 | 1 (200ms 페이드) | — |
| WebGL/3D | 가능성 있음 | **0** (3조) | ✓ 통과 |
| 파티클/물리 | 0 | **0** (3조) | ✓ 통과 |

**총 ScrollTrigger ≈ 40개 (메인 페이지 기준)** — RayRayLab 수준 밀도 확보.

---

## 13. 접근성 (5조 prefers-reduced-motion)

`@media (prefers-reduced-motion: reduce)` 일 때:

| 모션 | 처리 |
|---|---|
| 모든 scrub | **비활성** (요소는 최종 상태 즉시 적용) |
| 모든 enter/exit | duration 0.2s 단축, blur·scale 변환 제거 |
| infinite (frame·marquee·cue) | **정지** |
| pin (Visual Works) | **수직 스택으로 폴백** |
| cursor lerp | factor 1 (즉시 따라옴) |
| 페이지 전환 페이드 | duration 0.1s |

→ 의도: 콘텐츠는 모두 전달되지만 모션은 사라짐. **콘텐츠가 주인공 (1조)** 이라는 사상의 직접 증거.

---

## 14. 성능 가드레일

| 항목 | 기준 |
|---|---|
| 60fps 유지 | Desktop 1440 환경, 모든 모션 |
| GPU 가속 | `transform`, `opacity`, `filter` 만 사용 (layout 트리거 금지) |
| `will-change` | hover 가능 요소에만 (전역 X) |
| `ScrollTrigger.refresh()` | 리사이즈 debounce 250ms |
| `backdrop-filter` | Browser Frame 5개 이하 (모바일 2개) — GPU 비용 큼 |
| SVG filter | Intro에만 1회 정의 (전역 reuse) |
| 이미지 | next/image 또는 `<picture>` srcset, lazy load |
| 모바일 | Browser Frame 1~2개, pin 폴백, cursor 비활성 |

---

## 15. 3차 결과 요약

- **인터랙션 헌법 5조** — 모든 명세의 상위 규칙
- **ScrollTrigger ≈ 40개** — RayRayLab 밀도 유지
- **WebGL/3D/파티클/물리 0개** — 3조 준수
- **모든 hover/scrub/parallax/reveal/marquee 패턴 정의 완료**
- **Browser Frame 굴절 = CSS backdrop-filter + SVG displacementMap** (WebGL 없이 굴절감)
- **5조 reduced-motion 폴백 정의** — 콘텐츠 우선의 사상적 증거

— 3차 종료. 4차 (개발 구조 — 폴더/컴포넌트/페이지 구조, 우선순위 로드맵) 진행 승인 부탁드립니다.
