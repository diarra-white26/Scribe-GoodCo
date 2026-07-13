import type { ReactNode } from 'react';
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

/** Chat-widget chrome: avatar + name in a header bar, scrollable message
 *  thread, disabled input bar at the bottom to sell "this is a live chat." */
function ChatWidget({
  headerName,
  headerSubtitle,
  statusColor,
  children,
}: {
  headerName: string;
  headerSubtitle: string;
  statusColor: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-line-soft bg-stage-2 overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-line-soft bg-panel">
        <span className="relative flex-shrink-0 w-7 h-7 rounded-full bg-os/20 border border-os/30 flex items-center justify-center">
          <span className="text-os text-[12px] font-semibold">GC</span>
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-panel ${statusColor}`} />
        </span>
        <div className="min-w-0">
          <p className="text-[13.5px] font-medium text-ink truncate">{headerName}</p>
          <p className="text-[11.5px] text-ink-4 truncate">{headerSubtitle}</p>
        </div>
      </div>
      <div className="flex-1 space-y-2 p-3">{children}</div>
      <div className="flex items-center gap-2 px-3 py-2 border-t border-line-soft bg-panel">
        <span className="flex-1 text-[12.5px] text-ink-4 border border-line-soft rounded-full px-3 py-1.5 bg-stage-2 truncate">
          Type a message…
        </span>
        <SendGlyph />
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
      <ChatWidget headerName="Support chat" headerSubtitle="Virtual agent · Online" statusColor="bg-green">
        {messages.map((m, i) => (
          <ChatBubble key={i} message={m} />
        ))}
      </ChatWidget>
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

      <ChatWidget headerName="Support chat" headerSubtitle="Escalated · Priya joined" statusColor="bg-amber">
        {escalated.priorChat.map((m, i) => (
          <ChatBubble key={i} message={m} />
        ))}
        <SystemDivider text="Escalated to Priya, Tier-2 support" />
        <ChatBubble message={{ from: 'real-agent', text: escalated.realAgentReply }} />
      </ChatWidget>

      <div className="rounded-md border border-line-soft bg-panel p-2.5 mt-3">
        <p className="mono text-[11.5px] tracking-[0.16em] uppercase text-ink-4 mb-1.5">What the analyst's screen shows</p>
        <ul className="space-y-1">
          {escalated.analystContext.map((line) => (
            <li key={line} className="text-[13px] text-ink-2 leading-snug pl-3 relative before:content-['\2022'] before:absolute before:left-0 before:text-ink-4">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SystemDivider({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-1">
      <span className="mono text-[10.5px] tracking-[0.14em] uppercase text-ink-4 bg-panel-2 border border-line-soft rounded-full px-2.5 py-1">
        {text}
      </span>
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
      className={`flex items-end gap-1.5 ${isCustomer ? 'justify-start' : 'justify-end flex-row-reverse'}`}
    >
      <span
        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mono text-[9px] font-semibold ${
          isCustomer ? 'bg-panel-2 text-ink-4 border border-line-soft' : 'bg-os/25 text-os border border-os/40'
        }`}
      >
        {isCustomer ? 'C' : message.from === 'virtual-agent' ? 'A' : 'P'}
      </span>
      <div
        className={`max-w-[80%] px-2.5 py-1.5 ${
          isCustomer
            ? 'bg-panel border border-line-soft rounded-r-md rounded-tl-md rounded-bl-sm'
            : 'bg-os/12 border border-os/25 rounded-l-md rounded-tr-md rounded-br-sm'
        }`}
      >
        <p className={`mono text-[10.5px] tracking-[0.1em] uppercase mb-0.5 ${isCustomer ? 'text-ink-4' : 'text-os'}`}>{label}</p>
        <p className="text-[13.5px] text-ink-2 leading-snug text-pretty">{message.text}</p>
      </div>
    </motion.div>
  );
}

function SendGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-4 flex-shrink-0">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}
