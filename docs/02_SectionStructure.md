# 2차 — Section Structure & Wireframe (섹션 구조 / 와이어프레임)

> PARK MINJOO · UX/UI Designer Portfolio
> 단계 2/4 · 1차 IA 기반

---

## 0. 공통 시스템

### 0.1 그리드 시스템

| 항목 | Desktop (≥1280) | Tablet (768–1279) | Mobile (≤767) |
|---|---|---|---|
| Column | **12** | 8 | 4 |
| Gutter | 24px | 20px | 16px |
| Side Margin | 64px | 40px | 20px |
| Container | max-width 1440px (centered) | full-bleed | full-bleed |
| Baseline grid | 8px (모든 vertical spacing 8의 배수) | 동일 | 동일 |

### 0.2 타이포 시스템 (clamp 기반 유동)

| 토큰 | clamp(min, fluid, max) | 용도 |
|---|---|---|
| `display-XL` | clamp(96px, 18vw, 320px) | Intro "PORTFOLIO" / Transition 엔딩 |
| `display-L` | clamp(56px, 8vw, 128px) | Project Title · About 키워드 |
| `display-M` | clamp(36px, 5vw, 72px) | Section main statement |
| `heading` | clamp(24px, 3vw, 40px) | Visual Works item title |
| `body-L` | clamp(16px, 1.4vw, 20px) | About 설명, Project meta description |
| `body` | clamp(14px, 1.1vw, 16px) | 본문 |
| `label` | 12px (고정) | Section label `(About Me)`, meta date/category |

**폰트**:
- 영문 display: **Editorial Old / Neue Haas Grotesk Display** 류 (대형 타이포에 무게)
- 영문 body: **Inter** 또는 **GT America Mono** (technical 톤)
- 한글: **Pretendard** (Variable, 100–900)

### 0.3 컬러 토큰

| 토큰 | 값 | 용도 |
|---|---|---|
| `bg/canvas` | #F8F7F4 (off-white, paper) | 메인 배경 — quiet luxury의 종이 톤 |
| `bg/dark` | #0A0A0A | Transition Scene, 일부 강조 |
| `ink/primary` | #111111 | 본문 텍스트 |
| `ink/muted` | #6B6B6B | label, meta |
| `ink/inverse` | #F8F7F4 | dark 배경 위 텍스트 |
| `accent` | (보류 — 디자인 단계에서 1색 도입 검토) | hover, active |
| `frame/glass` | rgba(255,255,255,0.06) + backdrop-blur(20px) | Browser Frame 오브제 |

> **이미지/사진 위로 지나가는 텍스트는 `ink/inverse` 또는 `frame/glass` 위 밝은 톤** (FANCIVE overlay 규칙).

### 0.4 스크롤 길이 모듈화 (확장 대응)

| 섹션 | 고정 / 가변 | 공식 |
|---|---|---|
| 00 Intro | 고정 | 100vh |
| 01 About | 고정 | 180vh |
| **02 Web Projects** | **가변** | `60vh (label) + N × 70vh (card) + 20vh (transition out)` · N=프로젝트 수 |
| **03 Mobile Projects** | **가변** | `40vh (label) + M × 60vh (card)` · M=모바일 수 |
| 04 Content & Marketing | 고정 | 200vh |
| **05 Visual Works** | **가변 (가로)** | 화면상 100vh 점유, 내부 가로 트랙 길이 = `K × 60vw` · K=비주얼 작품 수. 수직 스크롤 환산: `K × 60vh` |
| 06 Transition | 고정 | 150vh |
| 07 Footer | 고정 | 100vh |

**기본 값 (N=7, M=2, K=5 가정)**:
- Web: 60 + 7×70 + 20 = 570vh
- Mobile: 40 + 2×60 = 160vh
- Visual: 300vh (수직 환산)
- **합계 ≈ 1660vh** (1차 1630vh 추정에서 미세 조정)

**K, N, M이 늘어도 코드 한 줄도 안 건드리고 늘어남** → 데이터 배열에 항목만 추가하면 ScrollTrigger가 자동 재계산.

---

## 1. SECTION 00 — Intro (100vh)

### 1.1 와이어프레임

```
┌─────────────────────────────────────────────────────────┐
│ [PARK MINJOO]               [WORK]  [CONTACT]           │ ← Nav (fixed)
│                                                          │
│                                                          │
│       ╭───────────╮                                      │
│       │  ▓▓▓▓▓▓  │  ← Browser Frame #1 (떠다님)         │
│       ╰───────────╯                                      │
│                                                          │
│   ┌──────────────────────────────────╮                   │
│   │ P O R T F O L I O                │  ← display-XL    │
│   └──────────────────────────────────╯  (중앙, 살짝 상단) │
│                       ╭────────╮                         │
│                       │ ▓▓▓▓▓ │  ← Browser Frame #2     │
│                       ╰────────╯                         │
│   ╭──────╮                                               │
│   │ ▓▓▓ │  ← Browser Frame #3                            │
│   ╰──────╯                                               │
│                                                          │
│                  please scroll ↓                         │
└─────────────────────────────────────────────────────────┘
```

### 1.2 명세

| 요소 | 위치 | 사이즈 | 비고 |
|---|---|---|---|
| Nav 좌 | top 32px / left 64px | label | "PARK MINJOO" |
| Nav 우 | top 32px / right 64px | label | WORK · CONTACT (24px gap) |
| PORTFOLIO 타이포 | 화면 중앙, 살짝 상단 (top 42%) | display-XL | letter-spacing -0.04em, 두께 medium |
| Browser Frame ×3~5 | viewport 전체 분산 | 폭 240~480px / 높이 180~320px (제각각) | `frame/glass` · backdrop-blur · 살짝 회전 (-8°~+8°) |
| scroll cue | bottom 40px center | label | bounce loop (1차 IA 6번 참조) |

### 1.3 반응형

- **Tablet**: Browser Frame 2~3개 / PORTFOLIO 타이포 14vw
- **Mobile**: Frame 1~2개 / PORTFOLIO 18vw, 한 줄에 안 들어가면 `PORT/FOLIO` 2줄 분절 (display 폰트의 의도된 분절)

### 1.4 콘텐츠 자리 (placeholder 단계)

콘텐츠 변경 없음 — Intro는 고정 카피.

---

## 2. SECTION 01 — About Me (180vh)

### 2.1 와이어프레임 (Desktop, 좌우 비대칭 2-col)

```
┌─────────────────────────────────────────────────────────┐
│ (About Me)                                               │ ← label, top 8vh
│                                                          │
│                                                          │
│  ┌──────────────────────┐  ┌────────────────────────┐    │
│  │                      │  │  Career Snapshot       │    │
│  │   C R E A T E        │  │                        │    │
│  │   D E S I G N        │  │  Chinese Major         │    │
│  │   P U B L I S H      │  │  UX/UI Designer        │    │
│  │                      │  │  Web Publisher         │    │
│  │   (겹쳐졌다가 정렬)  │  │                        │    │
│  │                      │  │  ─────                 │    │
│  │   display-L          │  │                        │    │
│  │                      │  │  3 Years Work          │    │
│  │   col 1–7            │  │  5 Countries Solo      │    │
│  │                      │  │  2 Apps Published      │    │
│  │                      │  │                        │    │
│  │                      │  │  ─────                 │    │
│  │                      │  │                        │    │
│  │                      │  │  Figma  Photoshop      │    │
│  │                      │  │  Illustrator  HTML     │    │
│  │                      │  │  CSS  JS  GitHub       │    │
│  │                      │  │                        │    │
│  │                      │  │  col 8–12              │    │
│  └──────────────────────┘  └────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 2.2 세로 흐름 (180vh 동안의 상태 변화)

| 스크롤 진행 | 좌측 키워드 (CREATE/DESIGN/PUBLISH) | 우측 Career Snapshot |
|---|---|---|
| 0–30% | 3개 키워드가 **겹쳐진 상태**로 등장 (CSS stacking) | "Chinese Major" 1줄 등장 |
| 30–55% | 키워드가 **수직으로 분해되며 정렬** (y stagger) | "UX/UI Designer", "Web Publisher" 추가 |
| 55–75% | 키워드 완전 정렬 상태 유지 | 구분선 → 3 Years / 5 Countries / 2 Apps 줄별 reveal |
| 75–100% | 키워드 살짝 -y로 이탈 시작 | Tools 배열이 stagger 등장 (Figma…GitHub) |

> 좌측은 **"내가 무엇을 하는가"의 시: 타이포가 시간 위에서 정렬되는 모션**
> 우측은 **"내가 누구인가"의 산문: 사실의 누적**

### 2.3 명세

| 요소 | 그리드 | 타이포 | 비고 |
|---|---|---|---|
| `(About Me)` label | col 1, top 8vh | label · `ink/muted` | sticky 효과 없음 |
| 좌측 키워드 스택 | col 1–7 | display-L | 3 lines, mix-blend or stagger |
| 우측 Career Snapshot | col 8–12 | body-L | 3개 블록 (역할/숫자/도구), 각 블록 사이 56px |
| 구분선 | col 8–12 | 1px solid `ink/muted` (40% opacity) | 32px width로 짧게 |

### 2.4 반응형

- **Tablet**: 동일 비대칭 (col 1–5 / 6–8), 키워드 사이즈 10vw
- **Mobile**: **세로 스택** — 키워드 먼저(상), Career Snapshot 그 아래(하). 키워드는 mobile에선 정렬된 상태로 등장 (겹침 모션은 가독성 저하 → 단순화)

---

## 3. SECTION 02 — Web Projects (가변, 기본 570vh)

### 3.1 모듈 구조

```
[Label 60vh]
   ↓
[Card 1   70vh]
[Card 2   70vh]
[Card 3   70vh]
...
[Card N   70vh]
   ↓
[Out 20vh]
```

**모듈 추가 = 데이터 배열에 객체 1개 추가** — 자동으로 70vh 늘어남.

### 3.2 카드 와이어프레임 (1 card = 70vh)

```
┌─────────────────────────────────────────────────────────┐
│  Project 01 / Nov 2024 · UX·UI Web        col 1–4 top   │ ← meta
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │                                                  │    │
│  │     [ PLACEHOLDER VISUAL  16:9 또는 4:3 ]       │    │
│  │                                                  │    │
│  │     col 1–12, height 56vh                        │    │
│  │                                                  │    │
│  │     (clip-path bottom→top reveal, scale 1.08→1)  │    │
│  │                                                  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  PROJECT 01                              col 1–9 bottom │ ← display-L
│                                                          │
└─────────────────────────────────────────────────────────┘
```

> **타이틀이 visual 아래** — RayRayLab은 위에 두지만, 우리는 잡지 캡션처럼 visual 아래에 배치해 editorial 톤 강화.

### 3.3 명세 (per card)

| 요소 | 그리드 | 타이포 | 모션 (3차에서 상세) |
|---|---|---|---|
| Meta (date · category) | col 1–4, card top + 4vh | label | y 10→0, stagger date→category |
| Visual placeholder | col 1–12, height 56vh | — | clip-path 16:9 비율 유지 |
| Project Title | col 1–9, card bottom + 4vh | display-L | clip-path L→R reveal |
| Index number | col 11–12, card top, 우측정렬 | label | "01 / 07" 형식 — 진행감 |

### 3.4 카드 간 리듬

- 카드와 카드 사이 **간격 없음** (연속 reveal) — 사용자가 다음 카드를 빨리 보고 싶게.
- 단, 카드 진입/이탈 시 살짝의 parallax (이미지 y +30px, 타이틀 y -20px) — RayRayLab 패턴 차용.

### 3.5 데이터 스키마 (4차에서 코드화)

```
project = {
  index: '01',
  title: 'Project 01',
  date: 'Nov 2024',
  category: 'UX·UI Web',
  thumbnail: 'placeholder',     // 이미지 경로 (현재 placeholder)
  detailAnchor: '#project01'    // /projects 페이지 내 앵커
}
```

### 3.6 확장성

| 시나리오 | 결과 |
|---|---|
| 프로젝트 1개 추가 (N=8) | 섹션 +70vh = 640vh, 인덱스 라벨 자동 "01 / 08" |
| 프로젝트 2개 삭제 (N=5) | 섹션 -140vh = 430vh, 자동 재계산 |
| 카드 높이 변경 (70 → 80vh) | 토큰 1줄 수정으로 전체 일괄 변경 |

### 3.7 반응형

- **Tablet**: visual height 50vh, title col 1–6
- **Mobile**: card 80vh (작은 화면에서는 호흡 더 길게) / visual 4:3 / title col 1–4 풀폭

---

## 4. SECTION 03 — Mobile Projects (가변, 기본 160vh)

### 4.1 컨셉 — 디바이스 리듬 변환

웹 프로젝트가 **풀 폭 visual + 캡션** 이라면, 모바일은 **좁은 디바이스 mock + 좌우 비대칭 텍스트**.

### 4.2 와이어프레임 (1 mobile card = 60vh)

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│                            Mobile 01                     │
│                            App Launch · 2024             │ ← col 8–12
│                                                          │
│      ┌──────┐              MOBILE PROJECT 01             │
│      │      │                                            │
│      │ DEV  │              Description placeholder text  │
│      │ ICE  │              that explains the project     │
│      │ MOCK │              briefly in 2~3 lines.         │
│      │      │                                            │
│      │ col  │              ─────                         │
│      │ 2–5  │                                            │
│      └──────┘              [ View Detail →  ]            │
│                                                          │
│                            col 8–12                      │
└─────────────────────────────────────────────────────────┘
```

- 디바이스 mock은 **세로 디바이스 비율 9:19.5**, height ~48vh
- 짝수 카드는 mock을 우측에, 텍스트를 좌측에 (alternate)

### 4.3 명세

| 요소 | 그리드 | 타이포 |
|---|---|---|
| Device mock | col 2–5 (odd) / col 8–11 (even) | — |
| Mobile index + meta | mock 반대편 상단 | label |
| Mobile Title | display-M | 70px 정도 |
| Description | body-L · max 320px width | 2–3줄 |
| View Detail 링크 | label + → 화살표 | hover 시 화살표 8px → 16px 늘어남 |

### 4.4 확장성

데이터 배열 추가 시 자동 alternate. **mock이 좌/우 번갈아** → 단조로움 방지.

### 4.5 반응형

- **Tablet**: alternate 유지, mock col 1–4
- **Mobile**: **항상 mock 위 + 텍스트 아래** 세로 스택 (alternate 폐기)

---

## 5. SECTION 04 — Content & Marketing (200vh)

### 5.1 컨셉 — 종이가 펄럭이며 내려옴

RayRayLab Awards의 종이 모션을 차용. 각 경험 한 줄이 **종이 한 장**처럼 위에서 내려와 쌓임.

### 5.2 와이어프레임

```
┌─────────────────────────────────────────────────────────┐
│  (Content & Marketing)                                   │
│                                                          │
│                                                          │
│          ┌─────────────────────────────┐                 │
│          │ App Launch                   │  ← Paper 1     │
│          └─────────────────────────────┘                 │
│            ┌──────────────────────────────┐              │
│            │ Google Play Published         │ ← Paper 2   │
│            └──────────────────────────────┘              │
│          ┌─────────────────────────────────┐             │
│          │ SNS Promotion                    │ ← Paper 3  │
│          └─────────────────────────────────┘             │
│            ┌──────────────────────────┐                  │
│            │ Reels Content             │ ← Paper 4       │
│            └──────────────────────────┘                  │
│          ┌────────────────────────────────┐              │
│          │ Personal Vlog                   │ ← Paper 5   │
│          └────────────────────────────────┘              │
│            ┌──────────────────────┐                      │
│            │ Content Creation       │ ← Paper 6          │
│            └──────────────────────┘                      │
│          ┌────────────────────────────┐                  │
│          │ Marketing Experience        │ ← Paper 7       │
│          └────────────────────────────┘                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 5.3 명세

| 요소 | 그리드 | 타이포 | 시각 |
|---|---|---|---|
| Label | col 1, top | label | sticky 안 함 |
| Paper 1~7 | col 3–10 (살짝 왼/오 랜덤 ±32px) | heading | 카드 폭 가변, padding 24px 32px |
| Paper 배경 | `bg/canvas` + 살짝 무거운 그림자 (paper-y) | 1px border `ink/muted 12%` | x 살짝 회전 (-2°~+2°), 랜덤 |
| Stack | papers 간 y간격 -32px (살짝 겹침) | — | 종이 더미 느낌 |

### 5.4 확장성

데이터 배열에 1줄 추가하면 paper 1장 자동 추가. 회전·offset은 index 기반 함수로 계산 (시드 고정 → 새로고침해도 동일).

---

## 6. SECTION 05 — Visual Works (가변, 화면상 100vh / 가로 K × 60vw)

### 6.1 컨셉 — 수직 피로를 끊는 수평 환기

여기까지 4섹션이 수직이었음. 여기서 **휠을 가로 스크롤로 변환** (Lenis + ScrollTrigger 가로 트랙).

### 6.2 와이어프레임

```
┌─────────────────────────────────────────────────────────┐
│  (Visual Works)                          ← label fixed   │
│                                                          │
│  Poster · Banner · Graphic · Thumbnail · ...            │
│                                                          │
│  ╔═══════╗  ╔═══════╗  ╔═══════╗  ╔═══════╗  →→→ scroll │
│  ║       ║  ║       ║  ║       ║  ║       ║  →→→        │
│  ║  V01  ║  ║  V02  ║  ║  V03  ║  ║  V04  ║  →→→        │
│  ║       ║  ║       ║  ║       ║  ║       ║  →→→        │
│  ║       ║  ║       ║  ║       ║  ║       ║  →→→        │
│  ╚═══════╝  ╚═══════╝  ╚═══════╝  ╚═══════╝  →→→        │
│                                                          │
│  01 / K     02 / K     03 / K     04 / K   (counters)   │
└─────────────────────────────────────────────────────────┘
        ↑ 트랙은 화면 너비 × K (전체 가로 길이)
```

- 섹션 전체가 **pin** (수직 스크롤 잠금) 후 휠 → 가로 트랙 x 이동
- 각 아이템 폭 = 화면의 50vw (Desktop), gap 8vw → 한 화면에 1.5개 보임

### 6.3 명세 (per item)

| 요소 | 사이즈 | 타이포 |
|---|---|---|
| Item 카드 | 50vw × 70vh | — |
| Visual placeholder | 카드 풀폭 | — |
| Item index | 카드 하단 좌측 | label "01 / K" |
| Item title | 카드 하단 좌측 (index 아래) | heading |
| Hover | scale 1.02, 옆 카드 살짝 어두워짐 (mask) | — |

### 6.4 확장성

| K (아이템 수) | 트랙 길이 | 수직 스크롤 환산 |
|---|---|---|
| 5 (기본) | 290vw (5×50 + 4×8 + 양끝 패딩) | 300vh |
| 10 | 580vw | 590vh |
| 20 | 1160vw | 1170vh |

> 항목 추가 = `visualWorks` 배열에 1개 → 자동으로 수평 트랙 + 카운터 + 인덱스 다 늘어남.

### 6.5 반응형

- **Tablet**: 카드 60vw, gap 6vw
- **Mobile**: **수평 → 수직 스택으로 폴백** (휠 가로 변환은 모바일 터치에서 부자연), 1열 카드 80vh

---

## 7. SECTION 06 — Transition Scene (150vh)

### 7.1 컨셉 — 캔버스의 끝, 서사의 마침

Visual Works가 끝나면 화면이 **암전**하며 메인 페이지를 떠다니던 Browser Frame이 모두 **중앙으로 모임** → 텍스트 시퀀스.

### 7.2 와이어프레임 (시간 진행순)

```
[t0]   Visual Works 종료
       └─ 화면 fade to bg/dark (0~30vh)

[t1]   ┌─────────────────────┐
       │                      │
       │    ╭──╮ ╭──╮ ╭──╮   │  ← Frame들이 화면 외곽에서
       │    ╰──╯ ╰──╯ ╰──╯   │     중앙으로 수렴 (30~60vh)
       │                      │
       │                      │
       └─────────────────────┘

[t2]   ┌─────────────────────┐
       │                      │
       │     P O R T F O L I O│  ← Frame들이 겹쳐진 자리
       │                      │     (60~80vh)
       │                      │
       └─────────────────────┘

[t3]            ↓ 줄별 순차 등장 (80~130vh)
       ┌─────────────────────┐
       │                      │
       │     PORTFOLIO        │
       │     PARK MINJOO      │
       │     UX/UI DESIGNER   │
       │     CONTACT          │
       │                      │
       └─────────────────────┘

[t4]   130~150vh: Footer로 자연 연결 (배경 dark → canvas 다시 환원)
```

### 7.3 명세

| 단계 | vh 범위 | 모션 |
|---|---|---|
| Fade to dark | 0–30 | bg `canvas` → `dark`, 800ms |
| Frame 수렴 | 30–60 | 각 Frame의 (마지막 위치) → (중앙) · scale 동기화 · 회전 0° |
| PORTFOLIO 등장 | 60–80 | Frame이 분해되며 그 자리에 텍스트 reveal |
| 4줄 시퀀스 | 80–130 | line stagger 0.15s, ease power3.out |
| Footer 연결 | 130–150 | bg `dark` → `canvas`, 텍스트 -y 100, opacity 0 |

### 7.4 반응형

- **Mobile**: Frame 수렴 단계 단순화 (수렴 거리 짧음), 4줄 텍스트 사이즈 ↓
- 핵심 시퀀스 (4줄 순차)는 유지

---

## 8. SECTION 07 — Footer (100vh)

### 8.1 와이어프레임

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  Contact                                                 │
│  hello@parkminjoo.com                ← display-M         │
│                                                          │
│  ────────────────────────                                │
│                                                          │
│  GitHub      →     github.com/minjoo073                  │
│  Notion      →     notion.so/...                         │
│  Resume PDF  →     /resume.pdf                           │
│                                                          │
│  ────────────────────────                                │
│                                                          │
│  © 2026 Park Minjoo  ·  Designed & developed by myself   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 8.2 명세

| 요소 | 그리드 | 타이포 |
|---|---|---|
| Contact label | col 1, top 30vh | label |
| Email | col 1–8 | display-M | hover 시 underline expand |
| Link 행 (×3) | col 1–8 | body-L | 좌 라벨, → 화살표 mid, 우 URL |
| Copyright | col 1, bottom 8vh | label |

### 8.3 반응형

- Mobile: 좌측 풀폭, display-M → 36px

---

## 9. /projects (Long Scroll Page) — 와이어프레임

### 9.1 전체 구조

```
┌──┬──────────────────────────────────────────────────────┐
│  │                                                       │
│i │   [#project01]                                        │
│n │      ┌──── Project 01 제작과정 ────┐                  │
│d │      │  intent / problem            │                 │
│e │      │  research                    │                 │
│x │      │  IA / wireframe              │                 │
│  │      │  interaction / motion        │                 │
│  │      │  result                      │                 │
│  │      └──────────────────────────────┘                 │
│01│                                                       │
│02│   Next: Project 02 →                                  │
│03│                                                       │
│04│   [#project02]                                        │
│05│      ...                                              │
│06│                                                       │
│07│   ...                                                 │
│M1│                                                       │
│M2│   [#mobile02]                                         │
│  │      ...                                              │
│  │                                                       │
│  │   ← Back to Main                                      │
│  │                                                       │
└──┴──────────────────────────────────────────────────────┘
 ↑ sticky 좌측 인덱스 (Desktop)
```

### 9.2 명세

| 요소 | 사이즈 |
|---|---|
| 좌측 인덱스 | width 80px, sticky top 0, height 100vh, 좌측 정렬 |
| 인덱스 항목 | label, vertical writing (또는 numbers only "01"~"07", "M1"·"M2") |
| 현재 active | `ink/primary` (나머지는 `ink/muted` 40%) |
| Project 콘텐츠 | col 2–11 (인덱스 제외), 각 프로젝트 끝에 "Next: →" |

### 9.3 각 프로젝트 내부 구조 (제작과정 5단)

```
[Intent]            의도 / 문제 정의      약 100vh
[Research]          유저 리서치 / 인사이트  약 120vh
[IA / Wireframe]    구조 / 와이어프레임   약 150vh
[Interaction]       인터랙션 / 모션       약 130vh
[Result]            최종 결과 / 회고      약 100vh
                                          ────────
                                          ≈ 600vh / 프로젝트
```

- 단계 사이는 **명확한 페이지브레이크 없음** (Long Scroll)
- 각 단계 시작에 작은 label `(01) Intent` 만

### 9.4 반응형

- Tablet: 인덱스 width 60px
- **Mobile**: 좌측 인덱스 → **상단 sticky 가로 인덱스** (높이 48px) — 1차 IA 8번 합의

---

## 10. 글로벌 컴포넌트 와이어프레임

### 10.1 Navigation (상단 고정)

```
┌─────────────────────────────────────────────────────────┐
│ PARK MINJOO                              WORK   CONTACT │
└─────────────────────────────────────────────────────────┘
   ↑ top 32px / side 64px (Desktop) · 24px / 20px (Mobile)
```

- 배경 없음 (`bg/canvas` 위에 그대로)
- 스크롤 시 mix-blend-difference 또는 `ink/primary` 유지 — **결정 보류** (Visual Works dark 구간에서 가독성 테스트 필요, 3차에서 확정)

### 10.2 Custom Cursor

```
default:    ●  (12px, ink/primary)
hover-card: ⬤ (48px 흰원, 내부 "View" 라벨)
hover-link: ●  (18px)
dark bg:    mix-blend-difference 자동 반전
```

### 10.3 Section Label (재사용 컴포넌트)

```
(About Me)        ← parens 포함, label 토큰, ink/muted
   ↑ 각 섹션 좌상단 col 1, top 6~8vh
```

### 10.4 Browser Frame (장식 오브제)

```
╭───────────────╮       ← 모서리 radius 12px
│ ● ● ●           │      ← 좌상단 dot 3개 (12px 영역)
│                  │
│  (투명/blur)     │      ← backdrop-filter: blur(20px)
│                  │       background: rgba(255,255,255,0.06)
│                  │       border: 1px solid rgba(255,255,255,0.12)
╰───────────────╯
```

- 사이즈 240×180 / 320×240 / 480×320 (3종)
- 회전 -8°~+8° 랜덤 (시드 고정)
- 위치는 섹션별로 다름 (3차에서 좌표 정의)

---

## 11. 콘텐츠 placeholder 규칙

| 종류 | 표기 |
|---|---|
| 텍스트 placeholder | `Project N` / `Mobile N` / `V0N` (대문자 + 인덱스) |
| 이미지 placeholder | 16:9 또는 4:3 비율의 `bg/canvas` 보다 약간 어두운 `#E8E6E0` 박스 + 중앙에 작은 인덱스 표기 (`01 / 07`) |
| 데이터 위치 | `data/projects.json` / `data/mobile.json` / `data/visualWorks.json` / `data/content.json` (4차에서 구조 확정) |

콘텐츠 후속 단계에서 이 placeholder를 1:1로 실제 콘텐츠로 교체. **컴포넌트 코드는 안 건드림.**

---

## 12. 2차 결과 요약

- **그리드 12/8/4** · **타이포 7단계 clamp** · **컬러 7토큰**
- **8섹션 와이어프레임 정의 + Project Detail 페이지 + 글로벌 컴포넌트 4종**
- **Web Projects(N), Mobile Projects(M), Visual Works(K)는 데이터 배열로 모듈화** → 코드 손 안 대고 확장
- 기본값(N=7, M=2, K=5) 기준 **메인 페이지 총 1660vh**, 프로젝트 디테일은 **프로젝트당 ≈600vh**

— 2차 종료. 3차 (인터랙션 설계 — 스크롤 리듬, GSAP/ScrollTrigger 시나리오, 호버, 굴절·종이·엔딩 모션) 진행 승인 부탁드립니다.
