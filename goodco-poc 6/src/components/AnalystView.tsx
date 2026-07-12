import { motion } from 'framer-motion';
import type { ChatMessage, ResolutionViews, Stage } from '../data/types';

interface Props {
  stage: Stage;
}

/**
 * Shows the two concrete, mutually-exclusive endings for a new ticket: what
 * the customer experiences when the virtual agent resolves it end to end
 * (Path A), and what both the customer and the analyst see when it escalates
 * instead (Path B) — the analyst gets the full prior chat and context, not a
 * cold handoff. Each Stage populates exactly one of these.
 */
export function AnalystView({ stage }: Props) {
  if (!stage.resolutionViews) {
    return null;
  }

  const { autoResolved, escalated } = stage.resolutionViews;

  return (
    <div className="space-y-3">
      <p className="mono text-[12px] tracking-[0.22em] uppercase text-ink-4">
        {escalated ? 'What the customer sees, then what the analyst sees' : 'What the customer sees'}
      </p>
      <div className={autoResolved && escalated ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : ''}>
        {autoResolved && (
          <ChatCard
            tone="auto"
            label={autoResolved.label}
            confidence={autoResolved.confidence}
            messages={autoResolved.messages}
            footer={autoResolved.footer}
          />
        )}
        {escalated && <EscalationCard escalated={escalated} />}
      </div>
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

function EscalationCard({ escalated }: { escalated: NonNullable<ResolutionViews['escalated']> }) {
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
