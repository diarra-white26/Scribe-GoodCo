import { motion } from 'framer-motion';
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
      <div className="flex flex-wrap gap-3 text-[14px]">
        <FieldPill label="Intent" value={artifact.intent} />
        <FieldPill label="Customer" value={artifact.accountLookup.customer} />
        <FieldPill label="Last login" value={artifact.accountLookup.lastLogin} />
        <FieldPill label="SSO provider" value={artifact.accountLookup.ssoProvider} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-md border border-os/35 bg-os/5 p-3"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="mono text-[12px] tracking-[0.18em] uppercase text-os">Resolution</p>
          <ConfidencePip value={artifact.confidence} />
        </div>
        <p className="text-[14.5px] text-ink-2 leading-relaxed text-pretty">{artifact.draftReply}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[13px] px-2.5 py-1 rounded-md border border-line bg-panel-2 text-ink-3">
            {artifact.agentAction === 'escalated-tier-2' ? 'Escalated to a Tier-2 analyst' : 'Resolved automatically, no analyst involved'}
          </span>
        </div>
      </motion.div>
    </div>
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
