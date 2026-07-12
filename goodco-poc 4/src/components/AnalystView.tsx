import { motion } from 'framer-motion';
import type { ChatMessage, ResolutionViews, Stage } from '../data/types';

interface Props {
  stage: Stage;
}

/**
 * Additive panel showing what a human sees, alongside the Agent Execution /
 * Eval / Output cards above, never in place of them. Stage 1 shows the
 * analyst's queue row once tickets arrive pre-tagged. Stage 2 shows the two
 * concrete outcomes of the Tier-1 model: the virtual agent resolving the
 * request end to end in chat, and the escalation path where a real analyst
 * picks up with the full prior chat history already attached.
 */
export function AnalystView({ stage }: Props) {
  if (!stage.analystQueuePreview && !stage.resolutionViews) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="mono text-[12px] tracking-[0.22em] uppercase text-ink-4">What a person sees</p>
      {stage.analystQueuePreview && <QueuePreview preview={stage.analystQueuePreview} />}
      {stage.resolutionViews && <ResolutionViewsPanel views={stage.resolutionViews} />}
    </div>
  );
}

function QueuePreview({ preview }: { preview: NonNullable<Stage['analystQueuePreview']> }) {
  return (
    <div className="rounded-lg border border-line-soft bg-panel p-4">
      <p className="text-[14px] text-ink-4 mb-3">{preview.before}</p>
      <p className="mono text-[12px] tracking-[0.18em] uppercase text-ink-4 mb-2">Analyst's queue, this ticket on arrival</p>
      <div className="flex items-center gap-3 rounded-md border border-line-soft bg-stage-2 px-3 py-2.5">
        <span className="w-2 h-2 rounded-full bg-os flex-shrink-0" />
        <span className="text-[15px] text-ink font-medium flex-1 min-w-0 truncate">{preview.after.subject}</span>
        <div className="flex gap-1.5 flex-shrink-0">
          {preview.after.tags.map((tag) => (
            <span key={tag} className="text-[12.5px] px-2 py-0.5 rounded-full border border-line bg-panel text-ink-3 whitespace-nowrap">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <p className="text-[13px] text-ink-4 mt-2">Already sorted. No manual read-and-tag step before this shows up.</p>
    </div>
  );
}

function ResolutionViewsPanel({ views }: { views: ResolutionViews }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <ChatCard
        tone="auto"
        label={views.autoResolved.label}
        confidence={views.autoResolved.confidence}
        messages={views.autoResolved.messages}
        footer={views.autoResolved.footer}
      />
      <EscalationCard escalated={views.escalated} />
    </div>
  );
}

function ChatCard({
  tone,
  label,
  confidence,
  messages,
  footer,
}: {
  tone: 'auto' | 'escalated';
  label: string;
  confidence: number;
  messages: ChatMessage[];
  footer?: string;
}) {
  const toneColor = tone === 'auto' ? 'text-green border-green/35 bg-green/10' : 'text-amber border-amber/35 bg-amber/10';
  return (
    <div className="rounded-lg border border-line-soft bg-panel p-3.5 flex flex-col">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[14px] font-medium text-ink">{label}</p>
        <span className={`mono text-[12.5px] px-2 py-0.5 rounded-full border ${toneColor}`}>{Math.round(confidence * 100)}%</span>
      </div>
      <div className="space-y-2 flex-1">
        {messages.map((m, i) => (
          <ChatBubble key={i} message={m} />
        ))}
      </div>
      {footer && <p className="text-[13px] text-ink-4 mt-3 leading-snug text-pretty">{footer}</p>}
    </div>
  );
}

function EscalationCard({ escalated }: { escalated: ResolutionViews['escalated'] }) {
  return (
    <div className="rounded-lg border border-amber/30 bg-amber/5 p-3.5 flex flex-col">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[14px] font-medium text-ink">{escalated.label}</p>
        <span className="mono text-[12.5px] px-2 py-0.5 rounded-full border text-amber border-amber/35 bg-amber/10">
          {Math.round(escalated.confidence * 100)}%
        </span>
      </div>
      <p className="text-[13px] text-ink-3 leading-snug text-pretty mb-2.5">
        <span className="text-amber font-medium">Why it escalated: </span>
        {escalated.trigger}
      </p>
      <p className="mono text-[11.5px] tracking-[0.16em] uppercase text-ink-4 mb-1.5">Prior chat, handed to the analyst</p>
      <div className="space-y-2 mb-3">
        {escalated.priorChat.map((m, i) => (
          <ChatBubble key={i} message={m} />
        ))}
      </div>
      <div className="rounded-md border border-line-soft bg-panel p-2.5 mb-2.5">
        <p className="mono text-[11.5px] tracking-[0.16em] uppercase text-ink-4 mb-1.5">Context passed to the analyst</p>
        <ul className="space-y-1">
          {escalated.analystContext.map((line) => (
            <li key={line} className="text-[13px] text-ink-2 leading-snug pl-3 relative before:content-['\2022'] before:absolute before:left-0 before:text-ink-4">
              {line}
            </li>
          ))}
        </ul>
      </div>
      <ChatBubble message={{ from: 'real-agent', text: escalated.realAgentReply }} />
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isCustomer = message.from === 'customer';
  const label = message.from === 'customer' ? 'Customer' : message.from === 'virtual-agent' ? 'Virtual agent' : 'Analyst';
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className={`max-w-[85%] rounded-md px-2.5 py-1.5 ${
          isCustomer ? 'bg-stage-2 border border-line-soft' : 'bg-os/10 border border-os/25'
        }`}
      >
        <p className={`mono text-[11px] tracking-[0.12em] uppercase mb-0.5 ${isCustomer ? 'text-ink-4' : 'text-os'}`}>{label}</p>
        <p className="text-[13.5px] text-ink-2 leading-snug text-pretty">{message.text}</p>
      </div>
    </motion.div>
  );
}
