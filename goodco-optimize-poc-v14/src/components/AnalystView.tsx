import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { ChatMessage, ResolutionViews, Stage } from '../data/types';

interface Props {
  stage: Stage;
}

/**
 * Shows the two concrete, mutually-exclusive endings for a new ticket: the
 * plain automated conversation script when the virtual agent resolves it end
 * to end (Path A), and a full analyst dashboard when it routes to a Tier-2
 * analyst instead (Path B) — everything the analyst needs to act, not a cold
 * handoff. Each
 * Stage populates exactly one of these.
 */
export function AnalystView({ stage }: Props) {
  if (!stage.resolutionViews) {
    return null;
  }

  const { autoResolved, escalated } = stage.resolutionViews;

  if (escalated) {
    return <AnalystDashboard stage={stage} escalated={escalated} />;
  }

  if (autoResolved) {
    return (
      <div className="space-y-2">
        <p className="mono text-[12px] tracking-[0.22em] uppercase text-ink-4">
          Customer automated conversation script
        </p>
        <p className="text-[12.5px] text-ink-4 italic -mt-1">
          Shown here as chat — the same script works as a phone call, text message, or email reply.
        </p>
        <ChatCard
          tone="auto"
          label={autoResolved.label}
          confidence={autoResolved.confidence}
          messages={autoResolved.messages}
          footer={autoResolved.footer}
        />
      </div>
    );
  }

  return null;
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

/** Static queue-strip flavor: real ticket next to it, plus a couple of other
 *  tickets sitting in the same queue, faded and non-interactive, so this
 *  reads as one view inside a real analyst tool rather than a single popup
 *  card floating in space. */
const QUEUE_FILLERS: Record<string, { title: string; customer: string; age: string; dot: string }[]> = {
  'path-b1-escalated-from-tier1': [
    { title: 'Space booking sync error', customer: 'Halden Group', age: '12m', dot: 'bg-ink-4' },
    { title: 'Visitor badge printing issue', customer: 'Ferro & Cole', age: '26m', dot: 'bg-ink-4' },
    { title: 'Password reset needed', customer: 'Brightline Co.', age: '38m', dot: 'bg-ink-4' },
  ],
  'path-b2-tier2-from-start': [
    { title: 'Password reset needed', customer: 'Brightline Co.', age: '9m', dot: 'bg-ink-4' },
    { title: 'Space booking sync error', customer: 'Halden Group', age: '31m', dot: 'bg-ink-4' },
    { title: 'Seat transfer request', customer: 'Marrow Systems', age: '47m', dot: 'bg-ink-4' },
  ],
};

const TICKET_META: Record<string, { ticketId: string; age: string }> = {
  'path-b1-escalated-from-tier1': { ticketId: 'GC-40218', age: '6m ago' },
  'path-b2-tier2-from-start': { ticketId: 'GC-40219', age: '3m ago' },
};

/**
 * The Path B "ending": a full analyst dashboard, styled like a real support
 * console (ticket queue, ticket header with priority/SLA, conversation +
 * customer context side by side, and a proper reply composer) rather than a
 * single chat-style card — this is a tool an analyst would actually work in
 * all day, not a one-off summary.
 */
function AnalystDashboard({ stage, escalated }: { stage: Stage; escalated: NonNullable<ResolutionViews['escalated']> }) {
  const meta = TICKET_META[stage.id] ?? { ticketId: 'GC-40200', age: '5m ago' };
  const fillers = QUEUE_FILLERS[stage.id] ?? [];
  const priorityLabel = stage.artifact.priority;
  const customerLine = stage.artifact.accountLookup.customer;

  return (
    <div className="rounded-lg border border-line-soft bg-panel overflow-hidden">
      {/* Ticket header: what any real support-console header shows up top */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 border-b border-line-soft bg-stage-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="mono text-[11px] text-ink-4">{meta.ticketId}</span>
            <span className="text-[10px] text-ink-4">·</span>
            <span className="text-[11px] text-ink-4">opened {meta.age}</span>
          </div>
          <p className="text-[14.5px] font-medium text-ink truncate">{stage.artifact.intent}</p>
          <p className="text-[12.5px] text-ink-4 truncate">{customerLine}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="mono text-[11px] px-2 py-0.5 rounded-full border text-coral border-coral/35 bg-coral/10">{priorityLabel}</span>
          <span className="mono text-[11px] px-2 py-0.5 rounded-full border text-amber border-amber/35 bg-amber/10">
            {Math.round(escalated.confidence * 100)}% confidence
          </span>
          <span className="flex items-center gap-1.5 pl-1">
            <span className="w-6 h-6 rounded-full bg-os/20 border border-os/35 flex items-center justify-center flex-shrink-0">
              <span className="text-os text-[10.5px] font-semibold">P</span>
            </span>
            <span className="text-[12px] text-ink-3 whitespace-nowrap">Priya M.</span>
          </span>
        </div>
      </div>

      <div className="px-4 py-2.5 border-b border-line-soft bg-amber/5">
        <p className="text-[13px] text-ink-3 leading-snug text-pretty">
          <span className="text-amber font-medium">Why it routed to Tier-2: </span>
          {escalated.trigger}
        </p>
        <ThresholdNote />
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Queue rail: sells "this is one ticket in a live queue," not a
            single card floating on its own. Non-interactive by design. */}
        <div className="w-full md:w-[168px] flex-shrink-0 border-b md:border-b-0 md:border-r border-line-soft bg-stage-2 px-2.5 py-3">
          <p className="mono text-[10px] tracking-[0.16em] uppercase text-ink-4 px-1.5 mb-2">Your queue · 4</p>
          <div className="rounded-md bg-os/12 border border-os/30 px-2 py-1.5 mb-1.5">
            <p className="text-[11.5px] font-medium text-ink truncate">{stage.artifact.intent}</p>
            <p className="text-[10.5px] text-ink-4 truncate">{customerLine.split(' · ')[0]}</p>
          </div>
          {fillers.map((f) => (
            <div key={f.title} className="px-2 py-1.5 opacity-45">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${f.dot}`} />
                <p className="text-[11.5px] text-ink-3 truncate">{f.title}</p>
              </div>
              <p className="text-[10.5px] text-ink-4 truncate pl-3">{f.customer} · {f.age}</p>
            </div>
          ))}
        </div>

        {/* Main: conversation left, customer + actions right */}
        <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 p-4">
          <div className="space-y-2 min-w-0">
            <TabStrip active="Conversation" tabs={['Conversation', 'Customer', 'Activity']} />
            <ChatWidget headerName="Support ticket" headerSubtitle={`Routed · awaiting Priya · ${meta.age}`} statusColor="bg-amber">
              {escalated.priorChat.map((m, i) => (
                <ChatBubble key={i} message={m} />
              ))}
              <SystemDivider text="Routed to Priya, Tier-2 support" />
            </ChatWidget>
          </div>

          <div className="space-y-3 min-w-0">
            <div className="rounded-md border border-line-soft bg-stage-2 p-2.5">
              <p className="mono text-[11px] tracking-[0.16em] uppercase text-ink-4 mb-1.5">Customer</p>
              <p className="text-[13px] text-ink-2 font-medium">{customerLine}</p>
              <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
                {stage.artifact.accountLookup.detail.map((d) => (
                  <div key={d.label} className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-ink-4 truncate">{d.label}</p>
                    <p className="text-[12px] text-ink-2 truncate">{d.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mono text-[11px] tracking-[0.16em] uppercase text-ink-4 mb-1.5">Ticket context</p>
              <ul className="space-y-1">
                {escalated.analystContext.map((line) => (
                  <li key={line} className="text-[13px] text-ink-2 leading-snug pl-3 relative before:content-['\2022'] before:absolute before:left-0 before:text-ink-4">
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-md border border-os/35 bg-os/5 p-2.5">
              <p className="mono text-[11px] tracking-[0.16em] uppercase text-os mb-1">Recommended next step</p>
              <p className="text-[13.5px] text-ink-2 leading-snug text-pretty">{escalated.recommendedNextStep}</p>
            </div>

            <ReplyComposer body={escalated.draftEmail} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Collapsed by default, matches the same "Why 0.85?" explainer that used
 *  to live in the separate Output box — folded in here now that Path B
 *  stages no longer render that box above the dashboard. */
function ThresholdNote() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-[12px] text-ink-4 hover:text-ink-2 transition-colors"
      >
        <ChevronGlyph open={open} />
        <span>Why this threshold?</span>
      </button>
      {open && (
        <p className="text-[12.5px] text-ink-3 leading-snug mt-1 pl-[15px] text-pretty">
          This confidence threshold is configurable, not fixed. GoodCo can set it higher to auto-resolve more
          conservatively while the model is new, or lower it as it proves out, without changing any code.
        </p>
      )}
    </div>
  );
}

function ChevronGlyph({ open }: { open: boolean }) {
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

/** Non-functional tab strip — sells "this is one view inside a bigger tool"
 *  the way a real Zendesk/Front-style ticket workspace would show tabs for
 *  the conversation, the customer record, and the audit trail. */
function TabStrip({ active, tabs }: { active: string; tabs: string[] }) {
  return (
    <div className="flex items-center gap-1 border-b border-line-soft">
      {tabs.map((t) => (
        <span
          key={t}
          className={`text-[12px] px-2.5 py-1.5 -mb-px border-b-2 ${
            t === active ? 'text-ink border-os font-medium' : 'text-ink-4 border-transparent'
          }`}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

/** A real reply composer: to/subject line, a lightweight formatting toolbar,
 *  and Discard/Send actions — not a small aside, this is the primary tool an
 *  analyst reaches for once they've read the ticket. Matches the source
 *  recommendation's own design: agent drafts, a person reviews and clicks
 *  Send, no auto-send in v1. */
function ReplyComposer({ body }: { body: string }) {
  return (
    <div className="rounded-md border border-line-soft bg-stage-2 overflow-hidden">
      <div className="flex items-center justify-between px-2.5 pt-2">
        <p className="mono text-[11px] tracking-[0.16em] uppercase text-ink-4">Reply · drafted, ready to send</p>
        <MailGlyph />
      </div>
      <p className="text-[11.5px] text-ink-4 px-2.5 pt-1">To: customer &nbsp;·&nbsp; Subject: Update on your ticket</p>
      <div className="mx-2.5 mt-2 rounded-md border border-line-soft bg-panel">
        <div className="flex items-center gap-2.5 px-2.5 py-1.5 border-b border-line-soft">
          <BoldGlyph />
          <ItalicGlyph />
          <LinkGlyph />
          <span className="w-px h-3.5 bg-line-soft" />
          <AttachGlyph />
        </div>
        <p className="text-[13.5px] text-ink-2 leading-relaxed text-pretty p-2.5">{body}</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-2">
        <div className="flex items-center gap-2">
          <span className="text-[12px] px-2.5 py-1 rounded-md border border-line-soft bg-panel text-ink-3">Discard</span>
          <span className="text-[12px] px-2.5 py-1 rounded-md border border-os/40 bg-os/15 text-os font-medium">Send</span>
        </div>
        <span className="text-[11px] text-ink-4">Priya reviews and clicks Send — no auto-send</span>
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

  // A customer's quick-reply selection renders as a small pill, not a full
  // bubble, so it reads visually as "picked a button" rather than "typed this."
  if (message.isQuickReply) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isCustomer ? 'justify-start pl-[26px]' : 'justify-end pr-[26px]'}`}
      >
        <span className="mono text-[11px] px-2.5 py-1 rounded-full border border-os/40 bg-os/15 text-os font-medium">
          {message.text}
        </span>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
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

      {message.options && message.options.length > 0 && (
        <div className={`flex flex-wrap gap-1.5 ${isCustomer ? 'justify-start pl-[26px]' : 'justify-end pr-[26px]'}`}>
          {message.options.map((opt) => (
            <span
              key={opt}
              className="text-[11.5px] px-2.5 py-1 rounded-full border border-line-soft bg-panel-2 text-ink-3"
            >
              {opt}
            </span>
          ))}
        </div>
      )}
    </div>
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

function MailGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-ink-4 flex-shrink-0">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function BoldGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-4 flex-shrink-0">
      <path d="M6 4h6a3.5 3.5 0 0 1 0 7H6z" />
      <path d="M6 11h7a3.5 3.5 0 0 1 0 7H6z" />
    </svg>
  );
}

function ItalicGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-ink-4 flex-shrink-0">
      <path d="M11 4h6" />
      <path d="M7 20h6" />
      <path d="M14 4 10 20" />
    </svg>
  );
}

function LinkGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-ink-4 flex-shrink-0">
      <path d="M9 15 15 9" />
      <path d="M11 6l1-1a4 4 0 0 1 6 6l-1 1" />
      <path d="M13 18l-1 1a4 4 0 0 1-6-6l1-1" />
    </svg>
  );
}

function AttachGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-ink-4 flex-shrink-0">
      <path d="M21 12.5 12.5 21a5 5 0 0 1-7-7L14 5.5a3.5 3.5 0 0 1 5 5L10.5 19a2 2 0 0 1-3-3L15 8" />
    </svg>
  );
}
