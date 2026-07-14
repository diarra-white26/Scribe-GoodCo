import { motion } from 'framer-motion';
import type { Pipeline } from '../data/types';
import { useApp } from '../store/appStore';

interface Props {
  pipeline: Pipeline;
}

export function WrapScreen({ pipeline }: Props) {
  const reset = useApp((s) => s.reset);

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg text-center"
      >
        <p className="mono text-[12px] tracking-[0.22em] uppercase text-os mb-3">End of walkthrough</p>
        <h1 className="text-[23px] font-semibold text-ink leading-snug text-pretty">{pipeline.wrapHero}</h1>
        <div className="mt-6 space-y-2">
          {pipeline.wrapStats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between rounded-md border border-line-soft bg-panel px-4 py-2.5 text-left"
            >
              <span className="text-[14.5px] text-ink-3">{stat.label}</span>
              <span className="text-[15px] text-ink font-medium">{stat.after}</span>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={reset}
          className="mt-7 px-5 py-2.5 rounded-md border border-line text-ink-2 text-[15.5px] font-medium hover:bg-panel-2 transition-colors"
        >
          Restart walkthrough
        </button>
      </motion.div>
    </div>
  );
}
