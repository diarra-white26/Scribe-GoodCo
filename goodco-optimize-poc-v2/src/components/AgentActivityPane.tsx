import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { ContextChip, Stage } from '../data/types';
import { StageContextLayer } from './StageContextLayer';
import { StageArtifactCard } from './StageArtifactCard';

const ACTIVITY_HOLD_MS = 3200;

interface Props {
  pipelineId: string;
  stage: Stage;
  inheritedChips: ContextChip[];
  onActivityDone: () => void;
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.2, 0.7, 0.3, 1] as const } },
};

export function AgentActivityPane({ pipelineId, stage, inheritedChips, onActivityDone }: Props) {
  const doneRef = useRef(false);

  useEffect(() => {
    doneRef.current = false;
    const timer = window.setTimeout(() => {
      doneRef.current = true;
      onActivityDone();
    }, ACTIVITY_HOLD_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.id]);

  return (
    <div className="flex flex-col gap-4 min-h-0 overflow-y-auto px-6 py-5">
      <div>
        <p className="mono text-[10px] tracking-[0.22em] uppercase text-os">{stage.label}</p>
        <h2 className="text-[19px] font-semibold text-ink mt-1 leading-snug">{stage.oneLine}</h2>
        <p className="text-[13px] text-ink-3 mt-1.5 leading-relaxed max-w-2xl text-pretty">{stage.businessPurpose}</p>
      </div>

      <StageContextLayer journeyId={pipelineId} stage={stage} inheritedChips={inheritedChips} consuming />

      {stage.scripts.map((script) => (
        <motion.div
          key={script.agentId}
          initial="hidden"
          animate="show"
          variants={listVariants}
          className="rounded-lg border border-line-soft bg-panel p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="mono text-[10px] tracking-[0.2em] uppercase text-ink-4">Agent execution</span>
          </div>
          <p className="text-[13.5px] font-medium text-ink">{script.agentName}</p>
          <p className="text-[12px] text-ink-4 mb-2.5">{script.agentRole}</p>
          <ul className="space-y-1.5">
            {script.agentActionBullets.map((bullet) => (
              <motion.li
                key={bullet}
                variants={itemVariants}
                className="text-[13px] text-ink-2 leading-snug pl-4 relative before:content-['\2022'] before:absolute before:left-0 before:text-os"
              >
                {bullet}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      ))}

      <motion.div
        initial="hidden"
        animate="show"
        variants={listVariants}
        transition={{ delayChildren: 0.5 }}
        className="rounded-lg border border-line-soft bg-panel p-4"
      >
        <span className="mono text-[10px] tracking-[0.2em] uppercase text-ink-4">Eval</span>
        <ul className="space-y-1.5 mt-2">
          {stage.evalLines.map((line) => (
            <motion.li
              key={line}
              variants={itemVariants}
              className="text-[12.5px] text-ink-3 leading-snug pl-4 relative before:content-['\2022'] before:absolute before:left-0 before:text-ink-4"
            >
              {line}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.4 }}>
        <StageArtifactCard artifact={stage.artifact} />
      </motion.div>
    </div>
  );
}
