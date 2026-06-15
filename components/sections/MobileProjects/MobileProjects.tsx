import { mobile } from '@/data/mobile'
import { SectionLabel } from '@/components/primitives/SectionLabel'
import { MobileCard } from './MobileCard'

/**
 * Mobile Projects 섹션 — 2차 §4.
 * 가변: 40vh(label) + M × 60vh(card).
 */
export function MobileProjects() {
  return (
    <section
      id="mobile"
      className="relative bg-dark text-ink-inverse px-side-m md:px-side-t xl:px-side-d py-[6vh]"
      data-section="mobile-projects"
    >
      <div className="h-[8vh]">
        <SectionLabel className="text-ink-inverse/70">Mobile Projects</SectionLabel>
      </div>

      <div className="flex flex-col" data-cards-wrapper>
        {mobile.map((project, i) => (
          <MobileCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  )
}
