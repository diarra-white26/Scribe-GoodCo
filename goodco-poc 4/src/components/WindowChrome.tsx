import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  address?: string;
}

/**
 * Real-Chrome-style browser chrome wrapping the app, not a stylized app-theme
 * bar. Colors here are hardcoded to actual Chrome light-mode tones on purpose
 * (independent of the app's own dark theme tokens) so it reads as "this is a
 * real browser showing the product" rather than another themed panel.
 *
 * The page scrolls naturally below the toolbar and bookmarks bar, this does
 * not clip content to the viewport height.
 */
export function WindowChrome({ children, address = 'scribe-good-co-nine.vercel.app' }: Props) {
  return (
    <div className="w-full min-h-screen bg-[#dee1e6]">
      <div className="sticky top-0 z-30 bg-[#dee1e6]">
        <Toolbar address={address} />
        <BookmarksBar />
      </div>
      <div className="bg-white">{children}</div>
    </div>
  );
}

function Toolbar({ address }: { address: string }) {
  return (
    <div className="h-12 flex items-center gap-2 px-2.5 bg-[#dee1e6] select-none">
      <NavIcon disabled>
        <ArrowGlyph dir="left" />
      </NavIcon>
      <NavIcon disabled>
        <ArrowGlyph dir="right" />
      </NavIcon>
      <NavIcon>
        <ReloadGlyph />
      </NavIcon>

      <div className="flex-1 h-8 flex items-center gap-2 px-3 rounded-full bg-white border border-[#dadce0] shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
        <TuneGlyph />
        <span className="text-[13.5px] text-[#202124] tracking-tight truncate flex-1">{address}</span>
        <StarGlyph />
        <InfoGlyph />
        <PuzzleGlyph />
      </div>

      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-os to-[#4a3aa7] flex items-center justify-center flex-shrink-0 ml-1">
        <span className="text-white text-[11px] font-medium">D</span>
      </div>
    </div>
  );
}

function BookmarksBar() {
  return (
    <div className="h-8 flex items-center gap-4 px-2.5 bg-[#dee1e6] border-b border-[#c8ccd0] select-none">
      <GridGlyph />
      <Bookmark label="GoodCo" />
      <Bookmark label="Scribe Optimize" />
      <span className="ml-auto flex items-center gap-1.5 text-[12px] text-[#5f6368]">
        <FolderGlyph />
        All Bookmarks
      </span>
    </div>
  );
}

function Bookmark({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[12px] text-[#3c4043]">
      <GlobeGlyph />
      {label}
    </span>
  );
}

function NavIcon({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      className={`w-8 h-8 rounded-full flex items-center justify-center ${disabled ? 'text-[#b0b3b8]' : 'text-[#5f6368] hover:bg-black/5'}`}
    >
      {children}
    </button>
  );
}

function ArrowGlyph({ dir }: { dir: 'left' | 'right' }) {
  const d = dir === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6';
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function ReloadGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

function TuneGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
      <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h14M22 18h0" />
      <circle cx="16" cy="6" r="2" fill="#5f6368" stroke="none" />
      <circle cx="6" cy="12" r="2" fill="#5f6368" stroke="none" />
      <circle cx="18" cy="18" r="2" fill="#5f6368" stroke="none" />
    </svg>
  );
}

function StarGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <path d="m12 2 3 7h7l-5.5 4 2 7-6.5-4.5L5.5 20l2-7L2 9h7l3-7z" />
    </svg>
  );
}

function InfoGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-5" />
      <circle cx="12" cy="8" r="0.6" fill="#5f6368" />
    </svg>
  );
}

function PuzzleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <path d="M9 3h4a1 1 0 0 1 1 1v2a2 2 0 1 0 0 4v2a1 1 0 0 1-1 1h-2a2 2 0 1 1-4 0H5a1 1 0 0 1-1-1v-4a2 2 0 1 0 0-4V3a1 1 0 0 1 1-1h4a2 2 0 1 0 0 4z" />
    </svg>
  );
}

function GridGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#5f6368" className="flex-shrink-0">
      <circle cx="5" cy="5" r="2" />
      <circle cx="12" cy="5" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="12" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
    </svg>
  );
}

function GlobeGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8ab4f8" strokeWidth="1.8" className="flex-shrink-0">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
    </svg>
  );
}

function FolderGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6z" />
    </svg>
  );
}
