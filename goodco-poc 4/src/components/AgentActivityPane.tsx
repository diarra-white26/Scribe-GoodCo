import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ContextChip, Stage } from '../data/types';
import { StageContextLayer } from './StageContextLayer';
import { StageArtifactCard } from './StageArtifactCard';
import { AnalystView } from './AnalystView';

interface Props {
  pipelineId: string;
  stage: Stage;
  inheritedChips: ContextChip[];
  onChipsReady: () => void;
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.2, 0.7, 0.3, 1] as const } },
};

export function AgentActivityPane({ pipelineId, stage, inheritedChips, onChipsReady }: Props) {
  useEffect(() => {
    // Not gating navigation on this, purely so the chip's arrival in the
    // Memory rail feels connected to the output card appearing rather than
    // popping in instantly. The walkthrough itself is fully manual otherwise.
    const timer = window.setTimeout(() => onChipsReady(), 900);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.id]);

  return (
    <div className="flex flex-col gap-4 px-6 py-5">
      <div>
        <p className="mono text-[12px] tracking-[0.22em] uppercase text-os">{stage.label}</p>
        <h2 className="text-[21px] font-semibold text-ink mt-1 leading-snug">{stage.oneLine}</h2>
        <p className="text-[15px] text-ink-3 mt-1.5 leading-relaxed max-w-2xl text-pretty">{stage.businessPurpose}</p>
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
            <span className="mono text-[12px] tracking-[0.2em] uppercase text-ink-4">Agent execution</span>
          </div>
          <p className="text-[15.5px] font-medium text-ink">{script.agentName}</p>
          <p className="text-[14px] text-ink-4 mb-2.5">{script.agentRole}</p>
          <ul className="space-y-1.5">
            {script.agentActionBullets.map((bullet) => (
              <motion.li
                key={bullet}
                variants={itemVariants}
                className="text-[15px] text-ink-2 leading-snug pl-4 relative before:content-['\2022'] before:absolute before:left-0 before:text-os"
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
        transition={{ delayChildren: 0.3 }}
        className="rounded-lg border border-line-soft bg-panel p-4"
      >
        <span className="mono text-[12px] tracking-[0.2em] uppercase text-ink-4">Eval</span>
        <ul className="space-y-1.5 mt-2">
          {stage.evalLines.map((line) => (
            <motion.li
              key={line}
              variants={itemVariants}
              className="text-[14.5px] text-ink-3 leading-snug pl-4 relative before:content-['\2022'] before:absolute before:left-0 before:text-ink-4"
            >
              {line}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.4 }}>
        <StageArtifactCard artifact={stage.artifact} />
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.4 }}>
        <AnalystView stage={stage} />
      </motion.div>
    </div>
  );
}
