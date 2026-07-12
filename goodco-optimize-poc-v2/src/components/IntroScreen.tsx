import { motion } from 'framer-motion';
import type { Pipeline } from '../data/types';
import { useApp } from '../store/appStore';

interface Props {
  pipeline: Pipeline;
}

export function IntroScreen({ pipeline }: Props) {
  const setScreen = useApp((s) => s.setScreen);
  const totalHours = pipeline.stages.reduce((sum, s) => sum + Number(s.heroStat.after.split(' ')[0]), 0);

  return (
    <div className="w-full h-full flex items-center justify-center px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl text-center"
      >
        <p className="mono text-[10px] tracking-[0.22em] uppercase text-os mb-3">Illustrative · demo only</p>
        <h1 className="text-[26px] font-semibold text-ink leading-snug text-balance">{pipeline.title}</h1>
        <p className="text-[14px] text-ink-3 mt-2">{pipeline.subtitle}</p>
        <div className="flex items-center justify-center gap-6 mt-6">
          <Stat label="Est. hours recovered" value={`${totalHours}/wk`} />
          <Stat label="Stages" value={String(pipeline.stages.length)} />
          <Stat label="Confidence" value="High" />
        </div>
        <button
          type="button"
          onClick={() => setScreen('pipeline')}
          className="mt-8 px-5 py-2.5 rounded-md bg-os text-white text-[13.5px] font-medium hover:opacity-90 transition-opacity"
        >
          Walk through the workflow
        </button>
      </motion.div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[19px] font-semibold text-ink">{value}</p>
      <p className="text-[10.5px] text-ink-4 mono tracking-wide uppercase mt-0.5">{label}</p>
    </div>
  );
}
