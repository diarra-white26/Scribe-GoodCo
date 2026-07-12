import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Pipeline } from '../data/types';
import { useApp } from '../store/appStore';
import { AgentActivityPane } from './AgentActivityPane';
import { ContextRail } from './ContextRail';
import { Icon } from './Icon';

const STAGE_HOLD_MS = 1600;

interface Props {
  pipeline: Pipeline;
}

export function PipelineShell({ pipeline }: Props) {
  const stageIndex = useApp((s) => s.stageIndex);
  const playMode = useApp((s) => s.playMode);
  const activityDone = useApp((s) => s.activityDone);
  const carriedChips = useApp((s) => s.carriedChips);
  const goToStage = useApp((s) => s.goToStage);
  const nextStage = useApp((s) => s.nextStage);
  const togglePlay = useApp((s) => s.togglePlay);
  const setActivityDone = useApp((s) => s.setActivityDone);
  const addChips = useApp((s) => s.addChips);

  const stage = pipeline.stages[stageIndex];

  useEffect(() => {
    if (!activityDone) {
      return;
    }
    addChips(stage.contextOut);
  }, [activityDone, stage, addChips]);

  useEffect(() => {
    if (!activityDone || playMode !== 'playing') {
      return;
    }
    const timer = window.setTimeout(() => nextStage(pipeline.stages.length), STAGE_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [activityDone, playMode, nextStage, pipeline.stages.length]);

  const inheritedChips = useMemo(() => {
    const ids = new Set(stage.inheritsFrom ?? []);
    return carriedChips.filter((c) => ids.has(c.id));
  }, [carriedChips, stage.inheritsFrom]);

  return (
    <div className="w-full h-full flex min-h-0">
      <div className="flex-1 min-w-0 flex flex-col min-h-0">
        <div className="flex-shrink-0 border-b border-line-soft px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold text-ink">{pipeline.title}</p>
            <p className="text-[11.5px] text-ink-4">{pipeline.subtitle}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {pipeline.stages.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goToStage(i)}
                className={`relative text-[11.5px] px-3 py-1.5 rounded-md mono tracking-tight transition-colors ${
                  i === stageIndex ? 'text-os bg-os/10' : 'text-ink-4 hover:text-ink-2'
                }`}
              >
                {s.shortLabel}
              </button>
            ))}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playMode === 'playing' ? 'Pause' : 'Play'}
              className="ml-2 w-7 h-7 rounded-full border border-line flex items-center justify-center text-ink-3 hover:text-ink"
            >
              <Icon name={playMode === 'playing' ? 'pause' : 'play'} size={13} />
            </button>
          </div>
        </div>

        <motion.div
          key={stage.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 min-h-0"
        >
          <AgentActivityPane
            pipelineId={pipeline.id}
            stage={stage}
            inheritedChips={inheritedChips}
            onActivityDone={() => setActivityDone(true)}
          />
        </motion.div>
      </div>

      <div className="w-[300px] flex-shrink-0 border-l border-line-soft">
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
