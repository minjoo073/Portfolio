import { projects } from '@/data/projects'
import { mobileProjects } from '@/data/mobile-projects'
import { about } from '@/data/about'
import { footer } from '@/data/footer'
import { experienceGroups } from '@/data/experience'
import { contentGroups } from '@/data/content'
import { visualWorks } from '@/data/visualWorks'

/**
 * /pdf — 포트폴리오 PDF 전용 슬라이드 덱 (16:9 가로, PPT형).
 *
 * 메인 페이지는 스크롤·sticky 애니메이션이라 그대로 인쇄가 불가능하므로,
 * 같은 디자인 언어로 각 섹션을 1280×720 슬라이드로 재구성한 문서 버전.
 *   Hero → About Statement → About Index → Experience
 *        → Web(8) → Mobile(2) → Content&Marketing → Visual Works → Contact
 *
 * 제작과정(케이스)은 분량이 많아 본문에 담지 않고 클릭 링크로 대체
 * (→ https://parkminjoo.com/work/<slug>).
 *
 * PDF 생성:  npm run pdf   (dev 서버 실행 중이어야 함)
 * 결과물:     public/portfolio/park-minjoo-portfolio.pdf
 */

// 제작과정(내부 /work/<slug>) 링크가 향할 실제 배포 주소.
// 현재 라이브: portfolio-r32m.vercel.app (parkminjoo.com 커스텀 도메인 연결 시 env 로 교체).
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio-r32m.vercel.app'
const abs = (href?: string) =>
  !href
    ? undefined
    : href.startsWith('http')
      ? href
      : `${SITE}${href}${href.endsWith('/') ? '' : '/'}` // trailingSlash 배포 대응

/** Next 이미지 최적화 엔드포인트로 압축본(webp) 사용 → PDF 용량 절감.
 *  w 는 next.config deviceSizes([640,768,1024,1280,1536,1920]) + 기본 imageSizes(…384) 만 허용. */
const img = (src?: string, w = 1280, q = 72) =>
  src ? `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${q}` : undefined

const MONTH: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
}
const krDate = (d: string) => {
  const [mon, year] = d.split(' ')
  return MONTH[mon] ? `${year}.${MONTH[mon]}` : d
}

const DARK = '#0A0A0A'
const CANVAS = '#F8F7F4'
const HERO_BG = '#EBEBEB'
const L = 'rgba(248,247,244,' // light ink (다크 위)
const D = 'rgba(17,17,17,'    // dark ink (라이트 위)

// 콘텐츠 슬라이드 배경 — #EBEBEB(중립 그레이)보다 아주 살짝 밝고 미세하게 웜한 소프트 아이보리.
// (완전 화이트는 아님) 다크 챕터 구분 슬라이드만 예외.
const PAGE = '#F1F0EC'

// 링크 강조색 — 포폴 크림/블랙 톤에 어울리는 어스톤 2색 (배경별 명도 분리)
//   site: 실사이트/스토어/라이브 → 클레이핑크(따뜻)
//   case: 제작과정/기획의도       → 딥 틸/사이안(차분)
const LINK_TONE: Record<'site' | 'case', { light: string; dark: string }> = {
  site: { light: '#B0595A', dark: '#E39B9B' },
  case: { light: '#2C6E6E', dark: '#83C0C0' },
}
type Tone = 'site' | 'case'
// 라벨 → 톤 매핑 (깃허브·카페24 는 색 없이 기본 잉크)
const toneOf = (label: string): Tone | undefined =>
  label === '실사이트' || label === '스토어' || label === '보러가기'
    ? 'site'
    : label === '깃허브' || label === '카페24'
      ? undefined
      : 'case'

const W = 1280
const H = 720

/* Experience 그룹별 한 줄 설명 (무엇을 다루는 챕터인지) */
const EXP_DESC: Record<string, string> = {
  'Marketing & Content': '콘텐츠 기획 · 채널 운영 · 숏폼 제작',
  'Design & Build': '디자인 · 퍼블리싱 · 실무 제작',
}

/* Content & Marketing 그룹별 핵심 지표 (증거형 3컬럼 hero 숫자) */
const CM_METRIC: Record<string, { big: string; sub: string }> = {
  'app-launch': { big: '출시', sub: 'Google Play · 2026' },
  'promotion': { big: '4편', sub: '15초 티저 시리즈 · IG / TikTok' },
  'personal': { big: '80K', sub: '3개월 도달 · 주 3–4회 발행' },
}

/* personal 채널 타이틀 — '학습 일지'(학생 톤) 대신 크리에이터 톤 */
const CM_TITLE: Record<string, string> = {
  personal: 'STUDY LOG · 콘텐츠 크리에이터',
}

/* Content & Marketing 컬럼별 짧은 설명 (증거 이미지 하단) */
const CM_DESC: Record<string, string> = {
  'app-launch': '팀 프로젝트에서 디자인·마케팅 담당 — 앱 아이콘·스토어·카피 제작.',
  'promotion': '빌드인퍼블릭 전략의 15초 티저 시리즈. 기획·촬영·편집 1인 진행.',
  'personal': 'UI/UX 작업 일상을 담은 콘텐츠 채널. 꾸준한 발행이 브랜드 협업으로.',
}

/* 브랜드 인바운드(먼저 온 협업 제안) — 표시용 이름·요약 */
const IB_NAME: Record<string, string> = {
  medicube: '메디큐브 · 올리브영',
  'ponder-ai': 'Ponder AI',
}
const IB_QUOTE: Record<string, string> = {
  medicube: '4월 올리브영 기획 협업을 제안드립니다.',
  'ponder-ai': '콘텐츠를 인상 깊게 보고 협업을 제안드립니다.',
}

const pdfStyle = `
  nav, .fixed { display: none !important; }
  html, body { background: ${DARK} !important; }
  @page { size: ${W}px ${H}px; margin: 0; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
  .slide { break-after: page; overflow: hidden; }
  .slide:last-child { break-after: auto; }
  a { color: inherit; text-decoration: none; }
`

function Slide({
  bg = DARK,
  pad = '64px 88px',
  children,
  style,
}: {
  bg?: string
  pad?: string
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <section
      className="slide"
      style={{
        width: `${W}px`,
        height: `${H}px`,
        background: bg,
        padding: pad,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {children}
    </section>
  )
}

/* 슬라이드 우하단 페이지 캡션 */
function Foot({ n, label, dark = true }: { n: string; label: string; dark?: boolean }) {
  const c = dark ? L : D
  return (
    <div
      style={{
        position: 'absolute',
        left: '88px',
        right: '88px',
        bottom: '34px',
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        letterSpacing: '0.14em',
        color: c + '0.4)',
      }}
    >
      <span>{label}</span>
      <span>{n}</span>
    </div>
  )
}

function LinkChip({ href, children, light = false, tone }: { href: string; children: React.ReactNode; light?: boolean; tone?: Tone }) {
  const toneColor = tone ? LINK_TONE[tone][light ? 'light' : 'dark'] : null
  const color = toneColor ?? (light ? D + '0.9)' : L + '0.95)')
  const border = toneColor ?? (light ? D + '0.4)' : L + '0.4)')
  return (
    <a
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '16px',
        fontWeight: tone ? 600 : 400,
        color,
        borderBottom: `1px solid ${border}`,
        paddingBottom: '2px',
      }}
    >
      <span>{children}</span>
      <span style={{ fontSize: '13px', opacity: tone ? 1 : 0.7 }}>↗</span>
    </a>
  )
}

function Stack({ items, dark = true }: { items: string[]; dark?: boolean }) {
  const clean = items.filter((s) => s !== '—')
  if (!clean.length) return null
  const c = dark ? L : D
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {clean.map((s) => (
        <span
          key={s}
          style={{
            fontSize: '13px',
            letterSpacing: '0.05em',
            color: c + '0.7)',
            background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(17,17,17,0.05)',
            padding: '4px 11px',
            borderRadius: '4px',
          }}
        >
          {s}
        </span>
      ))}
    </div>
  )
}

function SectionLabel({ en, kr, dark = true }: { en: string; kr: string; dark?: boolean }) {
  const c = dark ? L : D
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.2em', color: c + '0.55)' }}>{en}</span>
      <span style={{ fontSize: '14px', color: c + '0.45)' }}>{kr}</span>
      <span style={{ flex: 1, height: '1px', background: c + '0.14)' }} />
    </div>
  )
}

/* ══════════════ 웹/모바일 프로젝트 슬라이드 (body 좌 / visual 우) ══════════════ */
function ProjectSlide({
  index, total, wordmark, dateCat, meta, tagline, roles, stack, thumb, dim, links, footLabel, footN,
}: {
  index: string; total?: string; wordmark: string; dateCat: string; meta: string
  tagline?: string; roles?: string; stack: string[]; thumb?: string; dim?: boolean
  links: { label: string; href: string }[]; footLabel: string; footN: string
}) {
  return (
    <Slide bg={PAGE} pad="0" style={{ flexDirection: 'row' }}>
      {/* 본문 */}
      <div style={{ width: '38%', padding: '72px 44px 88px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.16em', color: D + '0.45)' }}>
            {index}{total ? ` / ${total}` : ''}
          </span>
          <span style={{ fontSize: '12px', color: D + '0.45)', textAlign: 'right', paddingLeft: '10px', wordBreak: 'keep-all' }}>{meta}</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '52px', fontWeight: 400, lineHeight: 0.98, letterSpacing: '-0.02em', color: D + '1)', marginTop: '12px' }}>
          {wordmark}
        </h2>
        <p style={{ fontSize: '13px', letterSpacing: '0.04em', color: D + '0.45)', marginTop: '14px', wordBreak: 'keep-all' }}>{dateCat}</p>
        {tagline && (
          <p style={{ fontSize: '16px', lineHeight: 1.5, color: D + '0.8)', marginTop: '18px', wordBreak: 'keep-all' }}>{tagline}</p>
        )}
        {roles && <p style={{ fontSize: '13.5px', color: D + '0.5)', marginTop: '14px', wordBreak: 'keep-all' }}>{roles}</p>}
        <div style={{ marginTop: '16px' }}><Stack items={stack} dark={false} /></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', marginTop: '26px' }}>
          {links.map((l) => <LinkChip key={l.href} href={l.href} light tone={toneOf(l.label)}>{l.label}</LinkChip>)}
        </div>
      </div>
      {/* 비주얼 — contain 으로 잘림 없이 전체 표시 */}
      <div style={{ width: '62%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 80px 64px 24px' }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: img(thumb, 1280) ? `url(${img(thumb, 1280)})` : undefined,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: dim ? 'brightness(0.92)' : undefined,
          }}
        />
      </div>
      <Foot n={footN} label={footLabel} dark={false} />
    </Slide>
  )
}

/* ══════════════ 챕터 인트로 슬라이드 (들어가기 전 라인업 예고) ══════════════ */
function WorkIntroSlide({
  kicker, lines, meta, items, foot,
}: {
  kicker: string
  lines: string[]
  meta: string
  items: { index: string; title: string; category: string }[]
  foot: string
}) {
  return (
    <Slide style={{ flexDirection: 'row', alignItems: 'center' }}>
      {/* 좌: 거대 타이포 슬레이트 */}
      <div style={{ width: '46%' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.2em', color: L + '0.5)' }}>{kicker}</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '128px', fontWeight: 400, lineHeight: 0.94, letterSpacing: '-0.03em', color: L + '1)', marginTop: '24px' }}>
          {lines.map((l, i) => <span key={i} style={{ display: 'block' }}>{l}</span>)}
        </h2>
        <div style={{ height: '1px', width: '100%', background: L + '0.25)', marginTop: '32px' }} />
        <p style={{ fontSize: '17px', letterSpacing: '0.04em', color: L + '0.55)', marginTop: '18px' }}>{meta}</p>
      </div>
      {/* 우: 라인업 (무엇을 보여줄지) */}
      <div style={{ width: '54%', paddingLeft: '56px' }}>
        {items.map((it) => (
          <div
            key={it.index}
            style={{ display: 'flex', alignItems: 'baseline', gap: '18px', padding: '12px 0', borderTop: `1px solid ${L}0.12)` }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', letterSpacing: '0.12em', color: L + '0.45)', width: '34px', flexShrink: 0 }}>{it.index}</span>
            <span style={{ fontSize: '18px', color: L + '0.95)', width: '150px', flexShrink: 0, wordBreak: 'keep-all' }}>{it.title}</span>
            <span style={{ fontSize: '13.5px', color: L + '0.5)', wordBreak: 'keep-all' }}>{it.category}</span>
          </div>
        ))}
      </div>
      <Foot n="" label={foot} />
    </Slide>
  )
}

/* ── 폰 목업 프레임 ── */
function PhoneMockup({ src, width = 190 }: { src?: string; width?: number }) {
  const bg = img(src, 640)
  return (
    <div
      style={{
        width: `${width}px`,
        aspectRatio: '9 / 19.5',
        background: '#111',
        borderRadius: `${Math.round(width * 0.16)}px`,
        padding: '7px',
        boxShadow: '0 26px 64px -22px rgba(0,0,0,0.75)',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: `${Math.round(width * 0.12)}px`,
          backgroundColor: '#000',
          backgroundImage: bg ? `url(${bg})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* 노치 */}
      <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', width: '32%', height: '9px', background: '#111', borderRadius: '6px' }} />
    </div>
  )
}

/* ── 모바일 2-up 슬라이드 (폰 목업 + 정보) ── */
function MobilePairSlide({
  apps, footLabel,
}: {
  apps: { index: string; title: string; sub: string; meta: string; tagline?: string; stack: string[]; links: { label: string; href: string }[]; thumb?: string }[]
  footLabel: string
}) {
  return (
    <Slide bg={PAGE}>
      <SectionLabel en="SELECTED WORK — MOBILE" kr="모바일 프로젝트" dark={false} />
      <div style={{ display: 'flex', gap: '40px', flex: 1, alignItems: 'center' }}>
        {apps.map((a) => (
          <div key={a.index} style={{ flex: 1, display: 'flex', gap: '30px', alignItems: 'center' }}>
            <PhoneMockup src={a.thumb} width={186} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.16em', color: D + '0.45)' }}>{a.index}</span>
                <span style={{ fontSize: '12px', color: D + '0.45)', textAlign: 'right', wordBreak: 'keep-all' }}>{a.meta}</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '44px', fontWeight: 400, lineHeight: 1, letterSpacing: '-0.02em', color: D + '1)', marginTop: '10px' }}>{a.title}</h2>
              <p style={{ fontSize: '13px', letterSpacing: '0.04em', color: D + '0.45)', marginTop: '12px', wordBreak: 'keep-all' }}>{a.sub}</p>
              {a.tagline && <p style={{ fontSize: '15px', lineHeight: 1.5, color: D + '0.8)', marginTop: '14px', wordBreak: 'keep-all' }}>{a.tagline}</p>}
              <div style={{ marginTop: '14px' }}><Stack items={a.stack} dark={false} /></div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '20px' }}>
                {a.links.map((l) => <LinkChip key={l.href} href={l.href} light tone={toneOf(l.label)}>{l.label}</LinkChip>)}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Foot n="" label={footLabel} dark={false} />
    </Slide>
  )
}

/* ── 웹 아카이브 2-up 슬라이드 (07/08 한 장에) ── */
function ArchivePairSlide({
  items, footLabel,
}: {
  items: { index: string; total: string; title: string; dateCat: string; tagline?: string; thumb?: string; dim?: boolean; links: { label: string; href: string }[] }[]
  footLabel: string
}) {
  return (
    <Slide bg={PAGE}>
      <SectionLabel en="SELECTED WORK — WEB · ARCHIVE" kr="웹 아카이브" dark={false} />
      <div style={{ display: 'flex', gap: '56px', flex: 1 }}>
        {items.map((it) => (
          <div key={it.index} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                width: '100%',
                aspectRatio: '16 / 10',
                backgroundImage: img(it.thumb, 1024) ? `url(${img(it.thumb, 1024)})` : undefined,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: it.dim ? 'brightness(0.92)' : undefined,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '18px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.14em', color: D + '0.45)' }}>{it.index} / {it.total}</span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 400, lineHeight: 1.05, color: D + '1)', marginTop: '10px', wordBreak: 'keep-all' }}>{it.title}</h3>
            <p style={{ fontSize: '13px', letterSpacing: '0.04em', color: D + '0.45)', marginTop: '10px', wordBreak: 'keep-all' }}>{it.dateCat}</p>
            {it.tagline && <p style={{ fontSize: '15px', lineHeight: 1.5, color: D + '0.75)', marginTop: '12px', wordBreak: 'keep-all' }}>{it.tagline}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
              {it.links.map((l) => <LinkChip key={l.href} href={l.href} light tone={toneOf(l.label)}>{l.label}</LinkChip>)}
            </div>
          </div>
        ))}
      </div>
      <Foot n="" label={footLabel} dark={false} />
    </Slide>
  )
}

export default function PdfPage() {
  const webProjects = projects.filter((p) => p.type === 'web')
  const featuredWeb = webProjects.filter((p) => p.displayType !== 'archive')
  const archiveWeb = webProjects.filter((p) => p.displayType === 'archive')
  const total = String(webProjects.length).padStart(2, '0')
  const { basicInfo, profile, skills, education, certificates, statement, body } = about

  return (
    <div style={{ background: DARK }}>
      <style dangerouslySetInnerHTML={{ __html: pdfStyle }} />

      {/* ═══════════ 1. HERO ═══════════ */}
      <Slide bg={PAGE} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.3em', color: D + '0.4)', marginBottom: '28px' }}>2026</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '168px', fontWeight: 400, letterSpacing: '0.04em', color: D + '0.95)', lineHeight: 1 }}>
          PORTFOLIO
        </h1>
        <div style={{ textAlign: 'center', marginTop: '40px', fontFamily: 'var(--font-mono)', fontSize: '14px', letterSpacing: '0.16em', lineHeight: 2 }}>
          <div style={{ fontWeight: 600, color: D + '0.9)' }}>박민주 / PARK MINJOO</div>
          <div style={{ color: D + '0.6)' }}>UX/UI 디자이너 &amp; 웹 퍼블리셔</div>
        </div>
        <Foot n="01" label="INTRO" dark={false} />
      </Slide>

      {/* ═══════════ 2. ABOUT — STATEMENT ═══════════ */}
      <Slide style={{ justifyContent: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: 400, lineHeight: 1.18, letterSpacing: '-0.01em', color: L + '1)' }}>
          {statement.map((l, i) => <span key={i} style={{ display: 'block' }}>{l}</span>)}
        </h2>
        <p style={{ fontSize: '17px', lineHeight: 1.8, color: L + '0.6)', marginTop: '36px', wordBreak: 'keep-all' }}>
          {body.map((l, i) => <span key={i} style={{ display: 'block' }}>{l}</span>)}
        </p>

        {/* 라이브 포트폴리오 안내 — 동적 웹이라 모션·구현은 라이브에서 */}
        <div style={{ marginTop: '52px', borderTop: `1px solid ${L}0.16)`, paddingTop: '20px', maxWidth: '640px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.16em', color: L + '0.5)', marginBottom: '10px' }}>LIVE PORTFOLIO</p>
          <p style={{ fontSize: '15px', lineHeight: 1.65, color: L + '0.62)', wordBreak: 'keep-all', marginBottom: '14px' }}>
            이 포트폴리오는 스크롤 인터랙션과 모션으로 구성된 웹입니다. PDF에는 정지 화면만 담겨, 실제 움직임과 구현은 라이브에서 확인하실 수 있습니다.
          </p>
          <LinkChip href={SITE} tone="site">라이브 포트폴리오 열기</LinkChip>
        </div>
        <Foot n="02" label="ABOUT" />
      </Slide>

      {/* ═══════════ 3. ABOUT INDEX ═══════════ */}
      <Slide bg={PAGE}>
        <SectionLabel en="ABOUT — INDEX" kr="소개 · 인덱스" dark={false} />
        <div style={{ display: 'flex', gap: '64px', flex: 1, alignItems: 'stretch' }}>
          {/* 좌: 증명사진(크게) → 태그라인 → 본문 세로 스택 */}
          <div style={{ width: '39%', display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                width: '184px',
                aspectRatio: '4 / 5',
                backgroundImage: img('/images/about/profile.jpg', 384) ? `url(${img('/images/about/profile.jpg', 384)})` : undefined,
                backgroundColor: '#e4e2dd',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '37px', fontWeight: 600, lineHeight: 1.12, letterSpacing: '-0.02em', color: D + '0.95)', wordBreak: 'keep-all', marginTop: '22px' }}>
              {profile.taglineLines.map((l, i) => <span key={i} style={{ display: 'block' }}>{l}</span>)}
            </h2>
            {/* 소개 — 원문 그대로, 폭에 맞춰 자연스럽게 2줄로 흐름 (수동 줄바꿈 X) */}
            <div style={{ marginTop: '18px', fontSize: '14.5px', lineHeight: 1.7, color: D + '0.62)' }}>
              {profile.intro.map((t, i) => (
                <p key={i} style={{ marginBottom: '12px', wordBreak: 'keep-all' }}>{t.replace(/\n/g, ' ')}</p>
              ))}
            </div>
          </div>
          {/* 우: 인덱스 정보 — 간격 좁혀 하나의 챕터처럼 (상단 정렬) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '26px', paddingTop: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
              <IndexBlock title="BASIC" dark={false}>
                <IdxRow>{basicInfo.name}</IdxRow>
                <IdxRow dim>{basicInfo.birth}</IdxRow>
                <IdxRow>{basicInfo.phone}</IdxRow>
                <IdxRow>{basicInfo.email}</IdxRow>
              </IndexBlock>
              <IndexBlock title="EDUCATION" dark={false}>
                {education.map((e) => <IdxRow key={e.name}>{e.name} <span style={{ color: D + '0.45)' }}>· {e.status}</span></IdxRow>)}
              </IndexBlock>
            </div>
            <IndexBlock title="SKILLS" dark={false}>
              {Object.entries(skills).map(([g, items]) => (
                <div key={g} style={{ display: 'flex', gap: '14px', marginBottom: '10px', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '13px', color: D + '0.5)', width: '68px', flexShrink: 0 }}>{g}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(items as readonly string[]).map((s) => (
                      <span key={s} style={{ fontSize: '13px', color: D + '0.85)', background: 'rgba(17,17,17,0.05)', padding: '3px 9px', borderRadius: '4px' }}>{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </IndexBlock>
            <IndexBlock title="CERTIFICATE" dark={false}>
              <div style={{ columns: 2, columnGap: '32px' }}>
                {certificates.map((c) => (
                  <div key={c.name} style={{ fontSize: '13.5px', lineHeight: 1.75, color: D + '0.8)', breakInside: 'avoid' }}>
                    {c.name}{c.date ? <span style={{ color: D + '0.45)' }}> · {c.date}</span> : null}
                  </div>
                ))}
              </div>
            </IndexBlock>
          </div>
        </div>
        <Foot n="03" label="ABOUT" dark={false} />
      </Slide>

      {/* ═══════════ 4. EXPERIENCE ═══════════ */}
      <Slide bg={PAGE}>
        <SectionLabel en="EXPERIENCE & ACTIVITIES" kr="경험 · 활동" dark={false} />
        {/* 리드 + 그룹을 세로 중앙 정렬해 하단 여백 균형 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* 이 섹션이 무엇을 보여주는지 리드 */}
          <p style={{ fontSize: '15px', lineHeight: 1.55, color: D + '0.72)', maxWidth: '780px', marginBottom: '24px', wordBreak: 'keep-all' }}>
            콘텐츠 기획·채널 운영과 숏폼 제작부터 디자인·퍼블리싱 실무까지 —
            디자인 밖의 영역에서도 직접 부딪히며 쌓아온 경험과 활동입니다.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '72px' }}>
            {experienceGroups.map((grp) => (
              <div key={grp.category} style={{ display: 'flex', flexDirection: 'column' }}>
                {/* 그룹 헤더 — 무엇을 다루는 챕터인지 */}
                <div style={{ borderTop: `1px solid ${D}0.16)`, paddingTop: '12px', marginBottom: '16px' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.12em', color: D + '0.82)' }}>{grp.category}</p>
                  <p style={{ fontSize: '12px', color: D + '0.5)', marginTop: '4px', letterSpacing: '0.02em' }}>{EXP_DESC[grp.category] ?? ''}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {grp.items.map((it) => (
                    <div key={it.title}>
                      {/* 날짜 — 제목 위 작은 에요브로 */}
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.08em', color: D + '0.42)', marginBottom: '4px' }}>{it.period}</p>
                      {/* 제목 — 주인공 (크고 굵게) */}
                      <p style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1.18, color: D + '0.92)', wordBreak: 'keep-all' }}>{it.title}</p>
                      {/* 상세 — 보조 (작고 연하게). 첫 줄(핵심 성과)만 살짝 강조 */}
                      <ul style={{ marginTop: '8px', paddingLeft: '0', listStyle: 'none' }}>
                        {it.details.map((d, i) => (
                          <li
                            key={i}
                            style={{
                              display: 'flex',
                              gap: '6px',
                              fontSize: '11.5px',
                              lineHeight: 1.45,
                              color: i === 0 ? D + '0.8)' : D + '0.52)',
                              fontWeight: i === 0 ? 500 : 400,
                              wordBreak: 'keep-all',
                              marginBottom: '2px',
                            }}
                          >
                            <span style={{ color: D + '0.3)', flexShrink: 0 }}>—</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <Foot n="04" label="EXPERIENCE" dark={false} />
      </Slide>

      {/* ═══════════ 5. WEB WORK — 인트로(라인업 예고) ═══════════ */}
      <WorkIntroSlide
        kicker={`SELECTED WORK — WEB · ${total} PROJECTS`}
        lines={['Web', 'Work']}
        meta="기획 · 디자인 · 퍼블리싱 · 2026"
        items={webProjects.map((p) => ({ index: p.index, title: p.wordmark ?? p.title, category: p.category }))}
        foot="WEB WORK — 라인업"
      />

      {/* ═══════════ 6. WEB PROJECTS — featured 1장씩 / archive 2장 묶음 ═══════════ */}
      {featuredWeb.map((p) => {
        const links: { label: string; href: string }[] = []
        if (p.studyHref) links.push({ label: p.studyLabel ?? '제작과정', href: abs(p.studyHref)! })
        if (p.siteHref) links.push({ label: '실사이트', href: p.siteHref })
        if (p.githubHref) links.push({ label: '깃허브', href: p.githubHref })
        if (p.skinHref && p.skinHref !== '#') links.push({ label: '카페24', href: p.skinHref })
        return (
          <ProjectSlide
            key={p.id}
            index={p.index}
            total={total}
            wordmark={p.wordmark ?? p.title}
            dateCat={`${krDate(p.date)} · ${p.category}`}
            meta={`${p.workType === 'original' ? '오리지널' : '리디자인'}${p.scale ? ` · ${p.scale}` : ''}`}
            tagline={p.tagline}
            roles={(p.role ?? []).filter((r) => r !== '—').join(' · ') || undefined}
            stack={p.stack ?? []}
            thumb={p.thumbnail}
            dim={p.dimThumb}
            links={links}
            footLabel="SELECTED WORK — WEB"
            footN={`${p.index} / ${total}`}
          />
        )
      })}

      {archiveWeb.length > 0 && (
        <ArchivePairSlide
          footLabel="SELECTED WORK — WEB"
          items={archiveWeb.map((p) => {
            const links: { label: string; href: string }[] = []
            if (p.studyHref) links.push({ label: p.studyLabel ?? '제작과정', href: abs(p.studyHref)! })
            if (p.siteHref) links.push({ label: '실사이트', href: p.siteHref })
            if (p.githubHref) links.push({ label: '깃허브', href: p.githubHref })
            return {
              index: p.index,
              total,
              title: p.wordmark ?? p.title,
              dateCat: `${krDate(p.date)} · ${p.category}`,
              tagline: p.tagline,
              thumb: p.thumbnail,
              dim: p.dimThumb,
              links,
            }
          })}
        />
      )}

      {/* ═══════════ 7. MOBILE WORK — 인트로(라인업 예고) ═══════════ */}
      <WorkIntroSlide
        kicker={`SELECTED WORK — MOBILE · ${mobileProjects.length} APPS`}
        lines={['Mobile', 'Work']}
        meta="기획 · 디자인 · 개발 · 2026"
        items={mobileProjects.map((m) => ({ index: m.index, title: m.title, category: m.category }))}
        foot="MOBILE WORK — 라인업"
      />

      {/* ═══════════ 8. MOBILE PROJECTS — 2-up 폰 목업 ═══════════ */}
      <MobilePairSlide
        footLabel="SELECTED WORK — MOBILE"
        apps={mobileProjects.map((m) => {
          const links: { label: string; href: string }[] = []
          if (m.studyHref) links.push({ label: '제작과정', href: abs(m.studyHref)! })
          const live = m.downloadLinks?.web ?? m.downloadLinks?.playStore
          if (live) links.push({ label: m.downloadLinks?.playStore ? '스토어' : '실사이트', href: live })
          return {
            index: m.index,
            title: m.title,
            sub: `${m.category}${m.role ? ` · ${m.role}` : ''}`,
            meta: `${m.releaseDate ?? ''}${m.platforms?.length ? ` · ${m.platforms.join(' / ')}` : ''}`,
            tagline: m.tagline,
            stack: m.stack ?? [],
            links,
            thumb: m.thumbnail,
          }
        })}
      />

      {/* ═══════════ 7. CONTENT & MARKETING — 증거형 3컬럼 ═══════════ */}
      <Slide bg={PAGE}>
        <SectionLabel en="CONTENT & MARKETING" kr="콘텐츠 · 마케팅" dark={false} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: '16px', lineHeight: 1.6, color: D + '0.72)', maxWidth: '840px', marginBottom: '26px', wordBreak: 'keep-all' }}>
            앱 출시부터 SNS 콘텐츠·개인 채널 운영까지 — 브랜드가 사용자에게 닿는 과정을 직접 기획하고 만들어 왔습니다.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px' }}>
            {contentGroups.map((g) => {
              const m = g.media as any
              const meta = CM_METRIC[g.id] ?? { big: g.receiptMeta, sub: '' }
              const link = m.storeUrl || m.apps?.[0]?.storeUrl || m.tiktokUrl || m.instagramUrl
              const linkLabel = m.storeUrl || m.apps?.[0]?.storeUrl ? '스토어' : '보러가기'
              const handle = m.instagramHandle || m.socialHandle

              const brands = g.id === 'personal' ? ((m.inbounds ?? []) as any[]).map((ib) => IB_NAME[ib.id] ?? ib.category) : null

              // ── 증거 비주얼 ──
              let visual: React.ReactNode = null
              if (m.type === 'app-launch' && m.apps?.[0]) {
                const app = m.apps[0]
                visual = (
                  <div style={{ display: 'flex', gap: '14px' }}>
                    {[{ src: app.icon, cap: '앱 아이콘' }, { src: app.qr, cap: '스토어 QR' }].map((x) => (
                      <div key={x.cap} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ width: '118px', height: '118px', backgroundColor: '#fff', backgroundImage: img(x.src, 256) ? `url(${img(x.src, 256)})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px' }} />
                        <span style={{ fontSize: '12px', color: D + '0.45)', textAlign: 'center' }}>{x.cap}</span>
                      </div>
                    ))}
                  </div>
                )
              } else if (m.videos?.length) {
                visual = (
                  <div style={{ display: 'flex', gap: '8px', height: '150px' }}>
                    {m.videos.slice(0, 4).map((v: any, i: number) => (
                      <div key={i} style={{ flex: 1, backgroundColor: '#d8d6d1', backgroundImage: img(v.thumbnail, 256) ? `url(${img(v.thumbnail, 256)})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '5px' }} />
                    ))}
                  </div>
                )
              }

              return (
                <div key={g.id} style={{ display: 'flex', flexDirection: 'column', borderTop: `1px solid ${L}0.2)`, paddingTop: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.14em', color: D + '0.5)' }}>{g.index}</span>
                    <span style={{ fontSize: '12px', letterSpacing: '0.06em', color: D + '0.5)' }}>{g.label}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '27px', fontWeight: 400, lineHeight: 1.1, color: D + '1)', marginTop: '12px', minHeight: '62px', wordBreak: 'keep-all' }}>
                    {CM_TITLE[g.id] || m.titleEn || g.label}
                  </h3>

                  <div style={{ marginTop: '18px' }}>{visual}</div>

                  {/* hero 지표 */}
                  <div style={{ marginTop: '24px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '34px', fontWeight: 400, lineHeight: 1, color: D + '1)' }}>{meta.big}</span>
                    <span style={{ fontSize: '13px', color: D + '0.55)', wordBreak: 'keep-all' }}>{meta.sub}</span>
                  </div>

                  {/* 짧은 설명 */}
                  <p style={{ marginTop: '16px', fontSize: '14px', lineHeight: 1.6, color: D + '0.62)', wordBreak: 'keep-all' }}>
                    {CM_DESC[g.id] ?? g.subLines.join(' ')}
                  </p>

                  {/* 개인채널: 브랜드 협업 제안 한 줄로 부각 */}
                  {brands && brands.length > 0 && (
                    <div style={{ marginTop: '14px', display: 'flex', gap: '9px', alignItems: 'baseline', wordBreak: 'keep-all' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', color: D + '0.5)', flexShrink: 0 }}>협업 제안</span>
                      <span style={{ fontSize: '14px', color: D + '0.9)' }}>{brands.join(', ')}</span>
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '18px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {handle && <span style={{ fontSize: '14px', color: D + '0.55)' }}>{handle}</span>}
                    {link && <LinkChip href={link} light tone="site">{linkLabel}</LinkChip>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <Foot n="—" label="CONTENT & MARKETING" dark={false} />
      </Slide>

      {/* ═══════════ 8. VISUAL WORKS ═══════════ */}
      <Slide bg={PAGE}>
        <SectionLabel en="VISUAL WORKS" kr="포스터 · 배너" dark={false} />
        {(() => {
          const posters = visualWorks.filter((v) => v.category === 'poster')
          const banners = visualWorks.filter((v) => v.category === 'banner')
          const rowLabel = (t: string) => (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.16em', color: D + '0.45)', marginBottom: '12px' }}>{t}</p>
          )
          return (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '40px' }}>
              {/* 포스터 — 4:5, 한 줄 8개. 좌우 여백 밖으로 살짝 bleed 해 크기 확대 */}
              <div>
                {rowLabel(`POSTER · ${String(posters.length).padStart(2, '0')}`)}
                <div style={{ display: 'flex', gap: '10px', marginInline: '-60px' }}>
                  {posters.map((v) => (
                    <div key={v.id} style={{ flex: 1, aspectRatio: '4 / 5', backgroundColor: '#d8d6d1', backgroundImage: `url(${img(v.thumbnail, 384)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  ))}
                </div>
              </div>
              {/* 배너 — 실제 43:10(초광폭), contain 으로 가로 안 잘리게 */}
              <div>
                {rowLabel(`BANNER · ${String(banners.length).padStart(2, '0')}`)}
                <div style={{ display: 'flex', gap: '12px', marginInline: '-60px' }}>
                  {banners.map((v) => (
                    <div key={v.id} style={{ flex: 1, aspectRatio: '43 / 10', backgroundColor: '#d8d6d1', backgroundImage: `url(${img(v.thumbnail, 640)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  ))}
                </div>
              </div>
            </div>
          )
        })()}
        <Foot n="—" label="VISUAL WORKS" dark={false} />
      </Slide>

      {/* ═══════════ 9. CONTACT ═══════════ */}
      <Slide bg={PAGE} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '92px', fontWeight: 400, letterSpacing: '-0.02em', color: D + '1)' }}>{footer.thanks}</h2>
        <p style={{ fontSize: '17px', color: D + '0.55)', marginTop: '18px' }}>{footer.thanksKr}</p>
        <div style={{ marginTop: '48px', display: 'flex', gap: '28px', fontSize: '16px' }}>
          <LinkChip href={`mailto:${footer.email}`} light>{footer.email}</LinkChip>
          <LinkChip href={footer.github} light>{footer.githubLabel}</LinkChip>
          <LinkChip href={footer.notion} light tone="site">Notion</LinkChip>
        </div>
        <p style={{ position: 'absolute', bottom: '34px', fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.14em', color: D + '0.35)' }}>
          {footer.copyright}
        </p>
      </Slide>
    </div>
  )
}

/* ── About Index 소분류 블록 ── */
function IndexBlock({ title, children, dark = true, span = false }: { title: string; children: React.ReactNode; dark?: boolean; span?: boolean }) {
  const c = dark ? L : D
  return (
    <div style={{ gridColumn: span ? '1 / -1' : undefined }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.14em', color: c + '0.5)', marginBottom: '10px' }}>{title}</p>
      {children}
    </div>
  )
}
function IdxRow({ children, dim = false }: { children: React.ReactNode; dim?: boolean }) {
  return <div style={{ fontSize: '14.5px', lineHeight: 1.8, color: (dim ? D + '0.5)' : D + '0.82)') }}>{children}</div>
}
