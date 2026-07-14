import { useLayoutEffect, useState, type RefObject } from 'react';
import type { ContextChip, Stage } from '../data/types';

interface Props {
  containerRef: RefObject<HTMLDivElement | null>;
  chips: ContextChip[];
  stages: Stage[];
  activeStageId: string | null;
}

interface Edge {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  active: boolean;
}

/**
 * SVG overlay that draws thin curved connectors between chips in the right
 * rail, tracing `Stage.inheritsFrom` lineage.
 *
 * We only draw edges whose *child* chip was produced by the active stage, so
 * at any moment the user sees just the inheritance for the stage they are
 * looking at. Past stages' inheritance fades out once that stage stops being
 * active, keeping the rail readable.
 *
 * Coordinates are read from `data-chip-id` anchors via `getBoundingClientRect`
 * relative to the container ref and recomputed on scroll, resize, or any
 * prop change. Decorative only (`pointer-events: none`); sits behind the
 * chip cards.
 */
export function MemoryGraph({ containerRef, chips, stages, activeStageId }: Props) {
  const [edges, setEdges] = useState<Edge[]>([]);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useLayoutEffect(() => {
    let raf = 0;
    let lastSize = { w: 0, h: 0 };
    let lastEdgesKey = '';

    function recompute() {
      const containerEl = containerRef.current;
      if (!containerEl) {
        return;
      }
      const containerRect = containerEl.getBoundingClientRect();
      const w = containerRect.width;
      const h = containerEl.scrollHeight;
      if (w !== lastSize.w || h !== lastSize.h) {
        lastSize = { w, h };
        setSize({ w, h });
      }

      const chipById: Record<string, ContextChip> = {};
      chips.forEach((c) => {
        chipById[c.id] = c;
      });
      const stageById: Record<string, Stage> = {};
      stages.forEach((s) => {
        stageById[s.id] = s;
      });

      const node: HTMLDivElement = containerEl;
      function chipRect(chipId: string): { left: number; top: number; width: number; height: number } | null {
        const el = node.querySelector<HTMLElement>(`[data-chip-id="${cssEscape(chipId)}"]`);
        if (!el) {
          return null;
        }
        const r = el.getBoundingClientRect();
        return {
          left: r.left - containerRect.left + node.scrollLeft,
          top: r.top - containerRect.top + node.scrollTop,
          width: r.width,
          height: r.height,
        };
      }

      const next: Edge[] = [];
      if (activeStageId) {
        chips.forEach((child) => {
          const stage = stageById[child.fromStageId];
          // Only draw lineage into the active stage's chips. Past stages'
          // inheritance is implied by ordering in the Generated context list.
          if (!stage || stage.id !== activeStageId) {
            return;
          }
          const derivesFrom = stage.inheritsFrom ?? [];
          if (derivesFrom.length === 0) {
            return;
          }
          const childRect = chipRect(child.id);
          if (!childRect) {
            return;
          }
          derivesFrom.forEach((parentId) => {
            if (!chipById[parentId]) {
              return;
            }
            const parentRect = chipRect(parentId);
            if (!parentRect) {
              return;
            }
            const x1 = Math.max(parentRect.left - 6, 4);
            const y1 = parentRect.top + parentRect.height / 2;
            const x2 = Math.max(childRect.left - 6, 4);
            const y2 = childRect.top + childRect.height / 2;
            next.push({ key: `${parentId}->${child.id}`, x1, y1, x2, y2, active: true });
          });
        });
      }

      const nextKey = next
        .map((e) => `${e.key}:${e.x1.toFixed(1)},${e.y1.toFixed(1)}->${e.x2.toFixed(1)},${e.y2.toFixed(1)}:${e.active ? 1 : 0}`)
        .join('|');
      if (nextKey !== lastEdgesKey) {
        lastEdgesKey = nextKey;
        setEdges(next);
      }
    }

    function scheduleRecompute() {
      if (raf !== 0) {
        return;
      }
      raf = requestAnimationFrame(() => {
        raf = 0;
        recompute();
      });
    }

    recompute();

    const containerEl = containerRef.current;
    if (!containerEl) {
      return;
    }
    // Observe each content list rather than the whole container, so the SVG's
    // own height changes don't trigger a feedback loop.
    const listEls = containerEl.querySelectorAll<HTMLElement>('ul, ol');
    const ro = new ResizeObserver(scheduleRecompute);
    listEls.forEach((el) => ro.observe(el));
    containerEl.addEventListener('scroll', scheduleRecompute, { passive: true });
    window.addEventListener('resize', scheduleRecompute);
    return () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
      }
      ro.disconnect();
      containerEl.removeEventListener('scroll', scheduleRecompute);
      window.removeEventListener('resize', scheduleRecompute);
    };
  }, [containerRef, chips, stages, activeStageId]);

  if (edges.length === 0) {
    return null;
  }
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={size.w}
      height={size.h}
      style={{ width: size.w, height: size.h }}
      aria-hidden
    >
      {edges.map((e) => (
        <ConnectorPath key={e.key} edge={e} />
      ))}
    </svg>
  );
}

function ConnectorPath({ edge }: { edge: Edge }) {
  const { x1, y1, x2, y2, active } = edge;
  const dy = y2 - y1;
  const cx = Math.max(Math.min(x1, x2) - 14, 2);
  const c1y = y1 + dy * 0.25;
  const c2y = y1 + dy * 0.75;
  const d = `M ${x1} ${y1} C ${cx} ${c1y}, ${cx} ${c2y}, ${x2} ${y2}`;
  return (
    <path
      d={d}
      stroke="#0066ff"
      strokeWidth={active ? 1.4 : 1}
      strokeOpacity={active ? 0.7 : 0.22}
      fill="none"
      strokeLinecap="round"
    >
      {active && (
        <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.4s" repeatCount="indefinite" />
      )}
      {active && <set attributeName="stroke-dasharray" to="3 6" />}
    </path>
  );
}

function cssEscape(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`);
}
