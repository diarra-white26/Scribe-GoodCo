import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { ContextChip, Stage } from '../data/types';
import { useApp } from '../store/appStore';
import { MemoryGraph } from './MemoryGraph';
import { Icon, type IconName } from './Icon';

interface Props {
  journeyId: string;
  /** All chips carried forward in this journey so far (monotonic). */
  chips: ContextChip[];
  /** Stages of the active journey (for lineage lookup in MemoryGraph and stage ordinals). */
  stages?: Stage[];
  /** The stage currently being walked. Drives every scoping decision in the rail. */
  stage?: Stage;
  /** Id of the stage currently being walked (drives connector highlighting in MemoryGraph). */
  activeStageId?: string | null;
  /** Chips that should carry a "Refined" badge because a prior stage explicitly
   *  sharpened them. Drives the badge in both the working set and earlier-memory list. */
  refinedChipIds?: Set<string>;
  /** Per-chip refined detail text. When a chip's id is present here, its
   *  rendered description in the rail is replaced with this updated text so the
   *  chip narrates what was learned, not just that it was reused. Keys must
   *  match `ContextChip.id`. */
  refinedChipDetails?: Record<string, string>;
}

/** All Icon component names, used at runtime to gate `c.emoji` against `IconName`. */
const ICON_NAMES = new Set<string>([
  'spark', 'lens', 'bolt', 'shield', 'heart', 'scan', 'map', 'target', 'beaker', 'send',
  'radio', 'book', 'route', 'scope', 'check', 'box', 'group', 'dna', 'doc', 'rank',
  'pulse', 'chart', 'lock', 'loop', 'radar', 'gap', 'star', 'ear', 'play', 'pause',
  'arrow-right',
]);

/**
 * Right pane. Scoped to the active stage:
 *  1. Data sources    only the inputs THIS stage taps (no accumulation).
 *  2. Context library the live working set: chips reused this stage + chips
 *                     produced this stage. Each reused chip carries a one-line
 *                     "Needed for ..." caption from stage.reuseRationale.
 *  3. View earlier memory (n) - collapsed expander revealing every prior chip
 *     as a compact numbered list. Same data-chip-id anchors so MemoryGraph
 *     lineage still draws when the expander is open.
 *
 * Reused chips stay visible in the library through the consume-and-return
 * animation; the chip-flight `layoutId` pill in the middle pane is a separate
 * Framer element. There is no "blink out" any more.
 */
export function ContextRail({
  journeyId,
  chips,
  stages,
  stage,
  activeStageId,
  refinedChipIds,
  refinedChipDetails,
}: Props) {
  const refined = refinedChipIds ?? new Set<string>();
  const refinedDetails = refinedChipDetails ?? {};
  const memoryRef = useRef<HTMLDivElement | null>(null);

  const [openSources, setOpenSources] = useState(true);
  const [openLibrary, setOpenLibrary] = useState(true);
  const [openHistory, setOpenHistory] = useState(false);

  const allStages = stages ?? [];
  const stageOrdinal: Record<string, number> = {};
  allStages.forEach((s, i) => {
    stageOrdinal[s.id] = i + 1;
  });

  // Scope sources to the active stage only.
  const sources = stage?.sources ?? [];

  // Live working set: chips reused this stage (inheritsFrom) + chips produced
  // this stage (fromStageId === stage.id). The remaining carried chips are the
  // "earlier memory" history.
  const inheritIds = useMemo(() => new Set(stage?.inheritsFrom ?? []), [stage?.inheritsFrom]);
  const reusedChips = useMemo(
    () => chips.filter((c) => inheritIds.has(c.id)),
    [chips, inheritIds],
  );
  const newChips = useMemo(
    () => chips.filter((c) => stage && c.fromStageId === stage.id),
    [chips, stage],
  );
  const workingIds = useMemo(() => {
    const ids = new Set<string>();
    reusedChips.forEach((c) => ids.add(c.id));
    newChips.forEach((c) => ids.add(c.id));
    return ids;
  }, [reusedChips, newChips]);
  const historyChips = useMemo(
    () => chips.filter((c) => !workingIds.has(c.id)),
    [chips, workingIds],
  );

  const workingCount = reusedChips.length + newChips.length;
  const viewLevel = useApp((s) => s.viewLevel);
  const isCxo = viewLevel === 'cxo';
  const rationale = (isCxo && stage?.cxoReuseRationale
    ? stage.cxoReuseRationale
    : stage?.reuseRationale) ?? {};

  return (
    <div className="w-full bg-stage-2 flex flex-col">
      <div className="px-4 pt-4 pb-2 border-b border-line-soft">
        <div className="flex items-baseline justify-between">
          <p className="mono text-[12px] tracking-[0.22em] uppercase text-os">Memory</p>
          <p className="mono text-[12px] text-ink-4">{workingCount} {workingCount === 1 ? 'entry' : 'entries'}</p>
        </div>
        <p className="text-ink-3 text-[14px] mt-1 leading-snug">What this stage is drawing on, reusing, and producing.</p>
      </div>

      <div className="relative px-4 py-3" ref={memoryRef}>
        <MemoryGraph
          containerRef={memoryRef}
          chips={chips}
          stages={allStages}
          activeStageId={activeStageId ?? null}
        />

        <section className="relative">
          <SectionHeader
            label="Data sources"
            count={sources.length}
            unit={sources.length === 1 ? 'source' : 'sources'}
            open={openSources}
            onToggle={() => setOpenSources((v) => !v)}
          />
          {openSources && (
            <>
              {sources.length === 0 ? (
                <p className="text-ink-4 text-[14px] italic text-center leading-relaxed py-3">This stage runs on memory alone.</p>
              ) : (
                <ul className="space-y-1">
                  {sources.map((src) => (
                    <li
                      key={`src-${src.id}`}
                      data-source-id={src.id}
                      className="relative flex items-start gap-2 pl-6 pr-2 py-1.5 rounded-md border border-line-soft bg-panel"
                      title={src.detail}
                    >
                      <span className="absolute left-2 top-2 text-ink-4">
                        <SourceGlyph />
                      </span>
                      <span className="flex-1 min-w-0 flex flex-col">
                        <span className="text-[14.5px] text-ink leading-snug truncate">{src.label}</span>
                        {src.detail && (
                          <span className="text-[12.5px] text-ink-4 leading-snug truncate">{src.detail}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>

        <section className="mt-4 pt-3 border-t border-line-soft">
          <SectionHeader
            label="Context library"
            count={workingCount}
            unit={workingCount === 1 ? 'chip' : 'chips'}
            open={openLibrary}
            onToggle={() => setOpenLibrary((v) => !v)}
          />
          {openLibrary && (
            <>
              {workingCount === 0 ? (
                <p className="text-ink-4 text-[14px] italic mt-3 text-center leading-relaxed">Outputs land here as the stage finishes.</p>
              ) : (
                <div className="mt-2 space-y-3">
                  {reusedChips.length > 0 && (
                    <ChipGroup label="Reused this stage">
                      {reusedChips.map((c) => (
                        <LibraryChip
                          key={`reuse-${c.id}`}
                          journeyId={journeyId}
                          chip={c}
                          tag="Reused"
                          rationale={rationale[c.id]}
                          refined={refined.has(c.id)}
                          refinedDetail={refinedDetails[c.id]}
                        />
                      ))}
                    </ChipGroup>
                  )}
                  {newChips.length > 0 && (
                    <ChipGroup label="New this stage">
                      {newChips.map((c) => (
                        <LibraryChip
                          key={`new-${c.id}`}
                          journeyId={journeyId}
                          chip={c}
                          tag="New"
                          refined={refined.has(c.id)}
                          refinedDetail={refinedDetails[c.id]}
                        />
                      ))}
                    </ChipGroup>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        {historyChips.length > 0 && (
          <section className="mt-4 pt-3 border-t border-line-soft">
            <button
              type="button"
              onClick={() => setOpenHistory((v) => !v)}
              aria-expanded={openHistory}
              className="w-full flex items-center justify-between mb-1.5 -mx-1 px-1 py-0.5 rounded hover:bg-ink/4 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Chevron open={openHistory} />
                <span className="mono text-[12px] tracking-[0.22em] uppercase text-ink-3">View earlier memory</span>
              </span>
              <span className="mono text-[12px] text-ink-4">{historyChips.length}</span>
            </button>
            {openHistory && (
              <ol className="relative space-y-1.5">
                {historyChips.map((c, i) => {
                  const isIcon = c.emoji && ICON_NAMES.has(c.emoji);
                  return (
                    <li
                      key={`hist-${c.fromStageId}-${c.id}`}
                      data-chip-id={c.id}
                      data-from-stage={c.fromStageId}
                      className="relative flex items-start gap-2 pl-6 pr-2 py-1.5 rounded-md border border-line-soft bg-panel"
                    >
                      <span className="absolute left-2 top-1.5 mono text-[12px] text-ink-4 select-none">{String(i + 1).padStart(2, '0')}</span>
                      <span className="flex-1 min-w-0 flex flex-col">
                        <span className="text-[14.5px] text-ink leading-snug truncate flex items-center gap-1.5" title={c.label}>
                          {isIcon ? (
                            <Icon name={c.emoji as IconName} size={12} className="text-os flex-shrink-0" />
                          ) : c.emoji ? (
                            <span aria-hidden className="text-[14px] flex-shrink-0">{c.emoji}</span>
                          ) : null}
                          <span className="truncate">{c.label}</span>
                        </span>
                        <span className="text-[12.5px] text-ink-4 mono leading-snug">
                          Stage {stageOrdinal[c.fromStageId] ?? '\u00b7'}
                        </span>
                      </span>
                      {refined.has(c.id) && (
                        <span className="mono text-[11px] tracking-[0.18em] uppercase text-os bg-os/8 border border-os/30 rounded-full px-1.5 py-[1px] flex-shrink-0 self-center">
                          Refined
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-line-soft flex items-center justify-between">
        <span className="mono text-[12px] tracking-[0.22em] uppercase text-ink-4">Memory size</span>
        <span className="mono text-[14px] text-os">{sources.length + workingCount}</span>
      </div>
    </div>
  );
}

interface SectionHeaderProps {
  label: string;
  count: number;
  unit: string;
  open: boolean;
  onToggle: () => void;
}

function SectionHeader({ label, count, unit, open, onToggle }: SectionHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="w-full flex items-center justify-between mb-1.5 -mx-1 px-1 py-0.5 rounded hover:bg-ink/4 transition-colors"
    >
      <span className="flex items-center gap-1.5">
        <Chevron open={open} />
        <span className="mono text-[12px] tracking-[0.22em] uppercase text-ink-3">{label}</span>
      </span>
      <span className="mono text-[12px] text-ink-4">{count} {unit}</span>
    </button>
  );
}

function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mono text-[11.5px] tracking-[0.22em] uppercase text-ink-4 mb-1">{label}</p>
      {/* role=list keeps semantic intent without making MemoryGraph's ResizeObserver
          loop on chip-flight layout animations. */}
      <div role="list" className="space-y-2">{children}</div>
    </div>
  );
}

interface LibraryChipProps {
  journeyId: string;
  chip: ContextChip;
  tag: 'Reused' | 'New';
  rationale?: string;
  refined: boolean;
  /** When present, replaces chip.detail so the rail shows the sharpened
   *  description authored by the most recent stage that refined this chip. */
  refinedDetail?: string;
}

function LibraryChip({ journeyId, chip, tag, rationale, refined, refinedDetail }: LibraryChipProps) {
  const viewLevel = useApp((s) => s.viewLevel);
  const dotClass = tag === 'Reused' ? 'bg-os/55' : 'bg-os';
  // Only the "New this stage" chip carries the shared layoutId so the chip-flight
  // from AgentActivityPane's output pill can morph into it. Reused chips render
  // as plain motion.divs so group transitions (Stage N output -> Stage N+1
  // reuse) don't trigger layoutId-driven layout animations.
  const sharedLayoutId = tag === 'New' ? `chip-${journeyId}-${chip.fromStageId}-${chip.id}` : undefined;
  const isCxo = viewLevel === 'cxo';
  const displayDetail = refinedDetail ?? (isCxo && chip.cxoDetail ? chip.cxoDetail : chip.detail);
  // Key the detail paragraph on the actual text so React animates a crossfade
  // whenever the description gets sharpened (rail goes from original copy to the
  // stage-authored refinement after the chip returns from the middle pane).
  const detailKey = refinedDetail ? `refined-${chip.id}` : `original-${chip.id}`;
  return (
    <motion.div
      role="listitem"
      layoutId={sharedLayoutId}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.7, 0.3, 1] }}
      className="relative bg-panel border border-line rounded-md p-2.5"
      data-chip-id={chip.id}
      data-from-stage={chip.fromStageId}
    >
      <div className="flex items-start gap-2">
        <span className={`mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 ${dotClass}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-ink text-[14.5px] font-medium leading-snug flex-1 min-w-0">{chip.label}</p>
            {refined ? (
              <span className="mono text-[11px] tracking-[0.18em] uppercase text-os bg-os/8 border border-os/30 rounded-full px-1.5 py-[1px] flex-shrink-0">
                Refined
              </span>
            ) : (
              <span className="mono text-[11px] tracking-[0.18em] uppercase text-ink-4 border border-line rounded-full px-1.5 py-[1px] flex-shrink-0">
                {tag}
              </span>
            )}
          </div>
          {rationale && tag === 'Reused' && (
            <p className="text-os/85 text-[13px] leading-snug mt-1 text-pretty">Needed for: {rationale}</p>
          )}
          <motion.p
            key={detailKey}
            initial={{ opacity: refinedDetail ? 0 : 1, y: refinedDetail ? 4 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.3, 1] }}
            className={`text-[13.5px] leading-snug mt-1 text-pretty ${refined ? 'text-ink-2' : 'text-ink-3'}`}
          >
            {refined && (
              <span className="mono text-[11.5px] tracking-[0.18em] uppercase text-os mr-1.5 align-baseline">
                Now ·
              </span>
            )}
            {displayDetail}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 12 12"
      className={`text-ink-4 transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 2l4 4-4 4" />
    </svg>
  );
}

function SourceGlyph() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7c0-2 3-3 7-3s7 1 7 3-3 3-7 3-7-1-7-3z" />
      <path d="M5 7v5c0 2 3 3 7 3s7-1 7-3V7" />
      <path d="M5 12v5c0 2 3 3 7 3s7-1 7-3v-5" />
    </svg>
  );
}
