import { create } from 'zustand';
import type { ContextChip } from '../data/types';

export type Screen = 'intro' | 'pipeline' | 'wrap';

interface AppState {
  screen: Screen;
  stageIndex: number;
  carriedChips: ContextChip[];
  viewLevel: 'detailed' | 'cxo';
  setScreen: (screen: Screen) => void;
  goToStage: (index: number) => void;
  nextStage: (stageCount: number) => void;
  addChips: (chips: ContextChip[]) => void;
  reset: () => void;
}

const EMPTY_CHIPS: ContextChip[] = [];

export const useApp = create<AppState>((set, get) => ({
  screen: 'intro',
  stageIndex: 0,
  carriedChips: EMPTY_CHIPS,
  viewLevel: 'detailed',

  setScreen: (screen) => set({ screen }),

  goToStage: (index) => set({ stageIndex: index }),

  nextStage: (stageCount) => {
    const { stageIndex } = get();
    if (stageIndex + 1 >= stageCount) {
      set({ screen: 'wrap' });
      return;
    }
    set({ stageIndex: stageIndex + 1 });
  },

  addChips: (chips) => {
    const existing = get().carriedChips;
    const existingIds = new Set(existing.map((c) => c.id));
    const fresh = chips.filter((c) => !existingIds.has(c.id));
    if (fresh.length === 0) {
      return;
    }
    set({ carriedChips: [...existing, ...fresh] });
  },

  reset: () => set({ screen: 'intro', stageIndex: 0, carriedChips: EMPTY_CHIPS }),
}));
