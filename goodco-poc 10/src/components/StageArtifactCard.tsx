import { useState } from 'react';
import type { StageArtifact } from '../data/types';

interface Props {
  artifact: StageArtifact;
}

export function StageArtifactCard({ artifact }: Props) {
  return (
    <div className="rounded-lg border border-line-soft bg-panel overflow-hidden">
      <div className="border-t-2 border-dashed border-os/40" />
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="mono text-[12px] tracking-[0.22em] uppercase text-ink-4">Output</span>
        <span className="mono text-[12px] text-ink-4 border border-line rounded-full px-2 py-0.5">
          {artifact.versionLabel}
        </span>
      </div>
      <div className="px-4 pb-4">
        <ReplyCard artifact={artifact} />
        <ThresholdNote />
      </div>
    </div>
  );
}

function ConfidencePip({ value }: { value: number }) {
  const tone = value >= 0.9 ? 'high' : value >= 0.7 ? 'medium' : 'low';
  const toneClass =
    tone === 'high'
      ? 'text-green border-green/35 bg-green/10'
      : tone === 'medium'
        ? 'text-amber border-amber/35 bg-amber/10'
        : 'text-ink-3 border-line bg-panel-2';
  return (
    <span className={`mono text-[13px] px-2 py-0.5 rounded-full border ${toneClass}`}>
      {Math.round(value * 100)}% confidence
    </span>
  );
}

function ReplyCard({ artifact }: { artifact: StageArtifact }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-[14px]">
        <FieldPill label="Intent" value={artifact.intent} />
        <FieldPill label="Priority" value={artifact.priority} />
        <FieldPill label="Customer" value={artifact.accountLookup.customer} />
        <FieldPill label="Last login" value={artifact.accountLookup.lastLogin} />
        <FieldPill label="SSO provider" value={artifact.accountLookup.ssoProvider} />
        <span className="ml-auto"><ConfidencePip value={artifact.confidence} /></span>
      </div>
      <p className="text-[13px] text-ink-4 leading-snug text-pretty">
        {artifact.agentAction === 'escalated-tier-2'
          ? 'Escalated to a Tier-2 analyst — full dashboard below.'
          : 'Resolved automatically, no analyst involved — conversation script below.'}
      </p>
    </div>
  );
}

function ThresholdNote() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2.5 border-t border-line-soft pt-2.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-1.5 text-[13px] text-ink-4 hover:text-ink-2 transition-colors"
      >
        <Chevron open={open} />
        <span>Why 0.85?</span>
      </button>
      {open && (
        <p className="text-[13px] text-ink-3 leading-snug mt-1.5 pl-[18px] text-pretty">
          This confidence threshold is configurable, not fixed. GoodCo can set it higher to auto-resolve more
          conservatively while the model is new, or lower it as it proves out, without changing any code.
        </p>
      )}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 12 12"
      className={`text-ink-4 transition-transform duration-150 flex-shrink-0 ${open ? 'rotate-90' : ''}`}
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

function FieldPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="px-2.5 py-1 rounded-md border border-line-soft bg-stage-2">
      <span className="text-ink-4">{label}: </span>
      <span className="text-ink-2 font-medium">{value}</span>
    </span>
  );
}
