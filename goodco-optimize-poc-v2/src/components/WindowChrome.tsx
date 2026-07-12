import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  address?: string;
}

/**
 * Faux macOS Safari window chrome wrapping the entire app.
 *
 * Visual contract: 36px header strip with traffic lights on the left, a centered
 * pill address bar reading the supplied address, and decorative top-right icons.
 * Everything is non-interactive: this is set dressing to anchor the OpenAI
 * Operations aesthetic. The window edge is a 1px neutral border with one soft
 * ambient shadow; the app content lives strictly underneath.
 */
export function WindowChrome({ children, address = 'openai.com' }: Props) {
  return (
    <div className="w-full h-screen min-h-0 bg-stage-2 flex flex-col p-2.5">
      <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-line bg-panel shadow-[0_8px_28px_rgba(15,15,14,0.05)] overflow-hidden">
        <ChromeBar address={address} />
        <div className="flex-1 min-h-0 bg-panel">{children}</div>
      </div>
    </div>
  );
}

function ChromeBar({ address }: { address: string }) {
  return (
    <div className="relative h-9 flex-shrink-0 flex items-center justify-between px-3 border-b border-line-soft bg-panel select-none">
      <div className="flex items-center gap-2 w-32">
        <TrafficLight color="#ff5f57" />
        <TrafficLight color="#febc2e" />
        <TrafficLight color="#28c840" />
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Reload"
          tabIndex={-1}
          className="w-5 h-5 rounded-md hover:bg-line-soft flex items-center justify-center text-ink-4 cursor-default"
        >
          <ChevronGlyph dir="left" />
        </button>
        <button
          type="button"
          aria-label="Forward"
          tabIndex={-1}
          className="w-5 h-5 rounded-md hover:bg-line-soft flex items-center justify-center text-ink-4 cursor-default"
        >
          <ChevronGlyph dir="right" />
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-stage-2 border border-line-soft min-w-[260px] justify-center">
          <LockGlyph />
          <span className="text-[11px] text-ink-3 mono tracking-tight">{address}</span>
        </div>
        <button
          type="button"
          aria-label="Reload page"
          tabIndex={-1}
          className="w-5 h-5 rounded-md hover:bg-line-soft flex items-center justify-center text-ink-4 cursor-default"
        >
          <ReloadGlyph />
        </button>
      </div>

      <div className="flex items-center gap-2 w-32 justify-end text-ink-4">
        <ShareGlyph />
        <PlusGlyph />
        <TabsGlyph />
      </div>
    </div>
  );
}

function TrafficLight({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="block w-3 h-3 rounded-full"
      style={{ background: color, boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)' }}
    />
  );
}

function ChevronGlyph({ dir }: { dir: 'left' | 'right' }) {
  const d = dir === 'left' ? 'M12 5l-6 7 6 7' : 'M8 5l6 7-6 7';
  return (
    <svg width="11" height="11" viewBox="0 0 20 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function LockGlyph() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-ink-3">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function ReloadGlyph() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

function ShareGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}

function PlusGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function TabsGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="14" height="14" rx="2" />
      <path d="M7 6V4a1 1 0 0 1 1-1h11a2 2 0 0 1 2 2v11a1 1 0 0 1-1 1h-2" />
    </svg>
  );
}
