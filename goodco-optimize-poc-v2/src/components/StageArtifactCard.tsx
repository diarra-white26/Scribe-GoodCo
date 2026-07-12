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
        <span className="mono text-[10px] tracking-[0.22em] uppercase text-ink-4">Output</span>
        <span className="mono text-[10px] text-ink-4 border border-line rounded-full px-2 py-0.5">
          {artifact.versionLabel}
        </span>
      </div>
      <div className="px-4 pb-4">
        {artifact.kind === 'ticket-categorization' ? (
          <TicketCard artifact={artifact} />
        ) : (
          <ReplyCard artifact={artifact} />
        )}
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
    <span className={`mono text-[11px] px-2 py-0.5 rounded-full border ${toneClass}`}>
      {Math.round(value * 100)}% confidence
    </span>
  );
}

function TicketCard({ artifact }: { artifact: Extract<StageArtifact, { kind: 'ticket-categorization' }> }) {
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-line-soft bg-stage-2 p-3">
        <p className="text-[11px] text-ink-4 mono">{artifact.ticket.requester}</p>
        <p className="text-[13.5px] font-medium text-ink mt-1">{artifact.ticket.subject}</p>
        <p className="text-[12.5px] text-ink-3 leading-snug mt-1 text-pretty">{artifact.ticket.body}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          className="rounded-md border border-line-soft p-3"
        >
          <p className="mono text-[10px] tracking-[0.18em] uppercase text-ink-4 mb-1.5">Before</p>
          <FieldRow label="Category" value={artifact.before.category} />
          <FieldRow label="Product" value={artifact.before.product} />
          <FieldRow label="Priority" value={artifact.before.priority} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-md border border-os/35 bg-os/5 p-3"
        >
          <div className="flex items-center justify-between mb-1.5">
            <p className="mono text-[10px] tracking-[0.18em] uppercase text-os">After</p>
            <ConfidencePip value={artifact.after.confidence} />
          </div>
          <FieldRow label="Category" value={artifact.after.category} accent />
          <FieldRow label="Product" value={artifact.after.product} accent />
          <FieldRow label="Priority" value={artifact.after.priority} accent />
          <FieldRow label="Queue" value={artifact.after.queue} accent />
        </motion.div>
      </div>
    </div>
  );
}

function ReplyCard({ artifact }: { artifact: Extract<StageArtifact, { kind: 'drafted-reply' }> }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 text-[12px]">
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
          <p className="mono text-[10px] tracking-[0.18em] uppercase text-os">Drafted reply</p>
          <ConfidencePip value={artifact.confidence} />
        </div>
        <p className="text-[12.5px] text-ink-2 leading-relaxed text-pretty">{artifact.draftReply}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-md border border-line bg-panel-2 text-ink-3">
            {artifact.agentAction === 'queued-for-review' ? 'Waiting for agent review, click Send' : 'Sent automatically'}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

function FieldRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[11px] text-ink-4">{label}</span>
      <span className={`text-[12px] font-medium ${accent ? 'text-ink' : 'text-ink-3'}`}>{value}</span>
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
