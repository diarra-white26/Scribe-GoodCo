import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Pipeline } from '../data/types';
import { useApp } from '../store/appStore';
import { AgentActivityPane } from './AgentActivityPane';
import { ContextRail } from './ContextRail';
import { Icon } from './Icon';

interface Props {
  pipeline: Pipeline;
}

export function PipelineShell({ pipeline }: Props) {
  const stageIndex = useApp((s) => s.stageIndex);
  const carriedChips = useApp((s) => s.carriedChips);
  const goToStage = useApp((s) => s.goToStage);
  const nextStage = useApp((s) => s.nextStage);
  const addChips = useApp((s) => s.addChips);

  const stage = pipeline.stages[stageIndex];
  const isLastStage = stageIndex === pipeline.stages.length - 1;

  const inheritedChips = useMemo(() => {
    const ids = new Set(stage.inheritsFrom ?? []);
    return carriedChips.filter((c) => ids.has(c.id));
  }, [carriedChips, stage.inheritsFrom]);

  return (
    <div className="w-full flex flex-col md:flex-row md:items-start">
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="sticky top-20 z-10 bg-panel border-b border-line-soft px-6 py-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-[16px] font-semibold text-ink">{pipeline.title}</p>
            <p className="text-[13.5px] text-ink-4">{pipeline.subtitle}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {pipeline.stages.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goToStage(i)}
                className={`relative text-[13.5px] px-3 py-1.5 rounded-md mono tracking-tight transition-colors ${
                  i === stageIndex ? 'text-os bg-os/10' : 'text-ink-4 hover:text-ink-2'
                }`}
              >
                {s.shortLabel}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          key={stage.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col"
        >
          <AgentActivityPane
            pipelineId={pipeline.id}
            stage={stage}
            inheritedChips={inheritedChips}
            onChipsReady={() => addChips(stage.contextOut)}
          />
          <div className="border-t border-line-soft px-6 py-4 flex justify-end">
            <button
              type="button"
              onClick={() => nextStage(pipeline.stages.length)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-os text-white text-[15px] font-medium hover:opacity-90 transition-opacity"
            >
              {isLastStage ? 'Finish walkthrough' : 'Continue to next stage'}
              <Icon name="arrow-right" size={14} />
            </button>
          </div>
        </motion.div>
      </div>

      <div className="w-full md:w-[320px] flex-shrink-0 border-t md:border-t-0 md:border-l border-line-soft md:sticky md:top-20 md:max-h-[calc(100vh-5rem)] md:overflow-y-auto">
        <ContextRail
          journeyId={pipeline.id}
          chips={carriedChips}
          stages={pipeline.stages}
          stage={stage}
          activeStageId={stage.id}
        />
      </div>
    </div>
  );
}
