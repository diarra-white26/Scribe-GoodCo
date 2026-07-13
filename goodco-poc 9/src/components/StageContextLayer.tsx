import { motion } from 'framer-motion';
import type { ContextChip, Stage } from '../data/types';

interface Props {
  journeyId: string;
  stage: Stage;
  inheritedChips: ContextChip[];
  consuming: boolean;
}

/**
 * Thin context layer above the middle pane.
 *
 * Two rows:
 *  - Pulling from   external sources the agent reaches into (live for the whole stage)
 *  - Reusing        inherited chips that this stage is actively reading from memory
 *
 * The reused pills are NOT shared layoutId with the rail. They render as their
 * own elements with a soft fade-in, so the matching rail card stays permanently
 * visible in Context library. This makes the memory feel persistent rather
 * than "shipped out and back".
 *
 * Each reused pill is captioned with `stage.reuseRationale[chip.id]` so the
 * partner can see WHY this chip is needed in this stage, not just THAT it is.
 */
export function StageContextLayer({ journeyId, stage, inheritedChips, consuming }: Props) {
  const sources = stage.sources ?? [];
  const showInherited = consuming && inheritedChips.length > 0;
  const rationale = stage.reuseRationale ?? {};
  void journeyId;

  if (sources.length === 0 && !showInherited) {
    return null;
  }

  return (
    <div className="flex-shrink-0 rounded-md border border-line-soft bg-panel px-3 py-2 space-y-2">
      {sources.length > 0 && <SourceRow items={sources} />}
      {showInherited && <InheritedRow chips={inheritedChips} rationale={rationale} />}
    </div>
  );
}

function SourceRow({ items }: { items: NonNullable<Stage['sources']> }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="mono text-[12px] tracking-[0.2em] uppercase text-ink-4 flex-shrink-0">Pulling from</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item.id}
            title={item.detail}
            className="text-[14px] px-2 py-0.5 rounded-full border border-line bg-panel text-ink-2 max-w-[240px] truncate"
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function InheritedRow({
  chips,
  rationale,
}: {
  chips: ContextChip[];
  rationale: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-2 flex-wrap">
        <span className="mono text-[12px] tracking-[0.2em] uppercase text-os flex-shrink-0 mt-1">Reusing</span>
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          {chips.map((c, i) => (
            <motion.div
              key={`${c.fromStageId}-${c.id}`}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: [0.2, 0.7, 0.3, 1], delay: i * 0.08 }}
              className="flex flex-col items-start gap-1"
            >
              <span className="text-[14px] px-2 py-0.5 rounded-full border border-os/35 bg-os/8 text-os leading-snug text-pretty">
                {c.label}
              </span>
              {rationale[c.id] && (
                <span className="text-[13.5px] text-ink-3 leading-snug text-pretty pl-1">
                  <span className="text-ink-4">Needed for: </span>
                  {rationale[c.id]}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
