import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ContextChip, Stage } from '../data/types';
import { StageContextLayer } from './StageContextLayer';
import { StageArtifactCard } from './StageArtifactCard';
import { AnalystView } from './AnalystView';
import { AgentExecutionFlow } from './AgentExecutionFlow';

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
      <p className="mono text-[12px] tracking-[0.22em] uppercase text-os">{stage.label}</p>

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
          <p className="text-[14px] text-ink-4 mb-3">{script.agentRole}</p>
          <AgentExecutionFlow steps={script.agentSteps} />
        </motion.div>
      ))}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.4 }}>
        <StageArtifactCard artifact={stage.artifact} />
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.4 }}>
        <AnalystView stage={stage} />
      </motion.div>
    </div>
  );
}
