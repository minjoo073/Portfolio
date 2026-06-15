import type { ContentMedia } from '@/lib/types/content'

type Props = Extract<ContentMedia, { type: 'personal-video' }>

/**
 * Personal Content 호버 preview — 채널 한 줄 + 9:16 grid 6편 + 큐레이션 노트.
 * 조회수/팔로워 수치 노출 없음.
 */
export function PersonalVideoPreview({ channel, videos, curationNote }: Props) {
  return (
    <div className="flex flex-col gap-8" data-preview="personal-video">
      {/* 채널 헤더 */}
      <header className="flex flex-col gap-2">
        <p className="font-display text-heading font-medium text-ink-inverse">{channel.handle}</p>
        <p className="font-kr text-body-l text-ink-inverse/65">{channel.concept}</p>
      </header>

      {/* 9:16 grid 3×2 = 6편 */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {videos.map((v, i) => (
          <div
            key={i}
            className="bg-ink-inverse/8 border-ink-inverse/15 relative overflow-hidden rounded-sm border"
            style={{ aspectRatio: '9 / 16' }}
            data-video-thumb
          >
            <span className="absolute inset-0 flex items-center justify-center font-mono text-label uppercase tracking-[0.06em] text-ink-inverse/40">
              ▶
            </span>
          </div>
        ))}
      </div>

      {/* divider + curation note */}
      <div className="flex flex-col gap-3">
        <div className="h-px w-8 bg-ink-inverse/40" />
        <p className="font-mono text-label uppercase leading-relaxed tracking-[0.05em] text-ink-inverse/60">
          {curationNote}
        </p>
      </div>

      {/* CTA */}
      <a
        href={channel.url}
        className="inline-flex items-center gap-2 self-start font-mono text-label uppercase tracking-[0.08em] text-ink-inverse"
      >
        <span>Visit Channel</span>
        <span aria-hidden>→</span>
      </a>
    </div>
  )
}
