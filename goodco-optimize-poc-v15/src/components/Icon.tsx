type IconName =
  | 'spark'
  | 'lens'
  | 'bolt'
  | 'shield'
  | 'heart'
  | 'scan'
  | 'map'
  | 'target'
  | 'beaker'
  | 'send'
  | 'radio'
  | 'book'
  | 'route'
  | 'scope'
  | 'check'
  | 'box'
  | 'group'
  | 'dna'
  | 'doc'
  | 'rank'
  | 'pulse'
  | 'chart'
  | 'lock'
  | 'loop'
  | 'radar'
  | 'gap'
  | 'star'
  | 'ear'
  | 'play'
  | 'pause'
  | 'arrow-right';

interface Props {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 16, className = '' }: Props) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className };
  switch (name) {
    case 'spark':
      return (
        <svg {...props}><path d="M12 2v8" /><path d="M12 14v8" /><path d="M2 12h8" /><path d="M14 12h8" /><path d="M5 5l4 4" /><path d="M15 15l4 4" /><path d="M5 19l4-4" /><path d="M15 9l4-4" /></svg>
      );
    case 'lens':
      return (<svg {...props}><circle cx="11" cy="11" r="6" /><path d="m20 20-3.5-3.5" /></svg>);
    case 'bolt':
      return (<svg {...props}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" /></svg>);
    case 'shield':
      return (<svg {...props}><path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z" /></svg>);
    case 'heart':
      return (<svg {...props}><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6C19 16.5 12 21 12 21z" /></svg>);
    case 'scan':
      return (<svg {...props}><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M7 12h10" /></svg>);
    case 'map':
      return (<svg {...props}><path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" /><path d="M9 3v15" /><path d="M15 6v15" /></svg>);
    case 'target':
      return (<svg {...props}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></svg>);
    case 'beaker':
      return (<svg {...props}><path d="M9 3h6" /><path d="M9 3v5l-5 12a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-12V3" /><path d="M7 14h10" /></svg>);
    case 'send':
      return (<svg {...props}><path d="m22 2-11 11" /><path d="M22 2 15 22l-4-9-9-4 20-7z" /></svg>);
    case 'radio':
      return (<svg {...props}><circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 0 1 0 8.49" /><path d="M7.76 16.24a6 6 0 0 1 0-8.49" /><path d="M20.12 4.88a10 10 0 0 1 0 14.14" /><path d="M3.88 19.02a10 10 0 0 1 0-14.14" /></svg>);
    case 'book':
      return (<svg {...props}><path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4V4z" /><path d="M4 16a4 4 0 0 1 4-4h12" /></svg>);
    case 'route':
      return (<svg {...props}><circle cx="5" cy="5" r="2" /><circle cx="19" cy="19" r="2" /><path d="M5 7v6a4 4 0 0 0 4 4h6a4 4 0 0 1 4 4" /></svg>);
    case 'scope':
      return (<svg {...props}><circle cx="12" cy="12" r="8" /><path d="M12 4v3" /><path d="M12 17v3" /><path d="M4 12h3" /><path d="M17 12h3" /></svg>);
    case 'check':
      return (<svg {...props}><path d="M4 12.5 9.5 18 20 7" /></svg>);
    case 'box':
      return (<svg {...props}><path d="M3 7v10l9 5 9-5V7l-9-5-9 5z" /><path d="m3 7 9 5 9-5" /><path d="M12 22V12" /></svg>);
    case 'group':
      return (<svg {...props}><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M15 20c0-2.4 1.8-4.4 4-4.9" /></svg>);
    case 'dna':
      return (<svg {...props}><path d="M4 4c4 4 12 12 16 16" /><path d="M20 4C16 8 8 16 4 20" /><path d="M7 7h4" /><path d="M13 13h4" /><path d="M9 9h2" /><path d="M13 17h2" /></svg>);
    case 'doc':
      return (<svg {...props}><path d="M6 2h8l4 4v16H6V2z" /><path d="M14 2v4h4" /><path d="M9 13h6" /><path d="M9 17h6" /></svg>);
    case 'rank':
      return (<svg {...props}><path d="M4 20V8" /><path d="M10 20V4" /><path d="M16 20v-9" /><path d="M22 20h-22" /></svg>);
    case 'pulse':
      return (<svg {...props}><path d="M3 12h4l3-7 4 14 3-7h4" /></svg>);
    case 'chart':
      return (<svg {...props}><path d="M4 20V10" /><path d="M9 20V4" /><path d="M14 20v-7" /><path d="M19 20v-12" /></svg>);
    case 'lock':
      return (<svg {...props}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>);
    case 'loop':
      return (<svg {...props}><path d="M21 8a8 8 0 0 0-13.5-3" /><path d="M3 16a8 8 0 0 0 13.5 3" /><path d="m3 4 4 4-4 0" /><path d="m21 20-4-4 4 0" /></svg>);
    case 'radar':
      return (<svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 12 21 6" /></svg>);
    case 'gap':
      return (<svg {...props}><path d="M5 12h4" /><path d="M15 12h4" /><circle cx="12" cy="12" r="1.5" /></svg>);
    case 'star':
      return (<svg {...props}><path d="m12 2 3 7h7l-5.5 4 2 7-6.5-4.5L5.5 20l2-7L2 9h7l3-7z" /></svg>);
    case 'ear':
      return (<svg {...props}><path d="M6 18a6 6 0 1 1 12 0c0 2-1 3-3 3s-2-1-3-2-2-1-3-1-3-0-3-0z" /></svg>);
    case 'play':
      return (<svg {...props}><path d="M6 4l14 8-14 8V4z" /></svg>);
    case 'pause':
      return (<svg {...props}><path d="M7 4v16" /><path d="M17 4v16" /></svg>);
    case 'arrow-right':
      return (<svg {...props}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>);
  }
}

export type { IconName };
