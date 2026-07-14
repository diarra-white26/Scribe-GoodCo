import { useState } from 'react';
import type { AgentStep } from '../data/types';

interface Props {
  steps: AgentStep[];
}

/**
 * Visual flow for what the agent does: one card per step, connected by
 * arrows, click a card to flip it and read the detail on the back. Replaces
 * a plain bulleted list so this can be walked through live rather than read.
 */
export function AgentExecutionFlow({ steps }: Props) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  const toggle = (i: number) =>
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });

  return (
    <div className="flex items-stretch gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
      {steps.map((step, i) => (
        <div key={step.title} className="flex items-stretch gap-1.5">
          <FlipCard index={i} step={step} isFlipped={flipped.has(i)} onToggle={() => toggle(i)} />
          {i < steps.length - 1 && <ArrowConnector />}
        </div>
      ))}
    </div>
  );
}

function FlipCard({
  index,
  step,
  isFlipped,
  onToggle,
}: {
  index: number;
  step: AgentStep;
  isFlipped: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isFlipped}
      className="relative flex-shrink-0 w-[230px] h-[176px] text-left [perspective:1200px] cursor-pointer group"
    >
      <div
        className="relative w-full h-full transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] [transform-style:preserve-3d]"
        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-lg border border-line-soft bg-panel p-3 flex flex-col justify-between group-hover:border-os/50 transition-colors">
          <span className="mono text-[11px] tracking-[0.18em] uppercase text-ink-4">Step {index + 1}</span>
          <p className="text-[15px] font-medium text-ink leading-snug">{step.title}</p>
          <span className="mono text-[11px] text-os flex items-center gap-1">
            Click for detail
            <FlipGlyph />
          </span>
        </div>
        <div
          className="absolute inset-0 [backface-visibility:hidden] rounded-lg border border-os/40 bg-os/8 p-3 flex flex-col justify-between overflow-y-auto"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <ul className="space-y-1">
            {step.detail.map((line, i) => (
              <li
                key={i}
                className="text-[12px] text-ink-2 leading-snug text-pretty pl-3 relative before:content-['\2022'] before:absolute before:left-0 before:text-os"
              >
                {line}
              </li>
            ))}
          </ul>
          <span className="mono text-[11px] text-ink-4 flex items-center gap-1 flex-shrink-0 pt-1">
            <FlipGlyph />
            Click to flip back
          </span>
        </div>
      </div>
    </button>
  );
}

function ArrowConnector() {
  return (
    <div className="flex-shrink-0 flex items-center justify-center w-6">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-4">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  );
}

function FlipGlyph() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
