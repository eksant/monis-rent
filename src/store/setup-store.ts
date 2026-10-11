import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

import { defaultSetup, emptySetup, presetSetup } from "@/data/presets";
import { type Order, parseOrder } from "@/lib/checkout";
import {
  addItem,
  normalizeSetup,
  parseSetup,
  removeItem,
  setChair,
  setDesk,
  setPlan,
  setPosture,
  type SetupResult,
  toggleItem,
} from "@/lib/setup";
import { decodeSetup } from "@/lib/share";
import type {
  CategoryId,
  Notice,
  Plan,
  Posture,
  PresetId,
  Setup,
} from "@/lib/types";

export interface StoreNotice extends Notice {
  id: number;
}

export type SceneView = "room" | "desk";

export interface SetupState {
  setup: Setup;
  hydrated: boolean;
  activeCategory: CategoryId;
  notice: StoreNotice | null;
  search: string;
  view: SceneView;
  lastOrder: Order | null;
  previousSetup: Setup | null;
  hydrate: () => Promise<void>;
  applyPreset: (id: PresetId) => void;
  startEmpty: () => void;
  toggle: (id: string) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  chooseDesk: (id: string) => void;
  chooseChair: (id: string | null) => void;
  choosePlan: (plan: Plan) => void;
  choosePosture: (posture: Posture) => void;
  showCategory: (category: CategoryId) => void;
  setSearch: (query: string) => void;
  setView: (view: SceneView) => void;
  editFromScene: (category: CategoryId) => void;
  placeOrder: (order: Order) => void;
  startNewSetup: () => void;
  applySuggestion: (setup: Setup) => void;
  undoSuggestion: () => void;
}

let noticeSeq = 0;
function stamp(notice: Notice | undefined): StoreNotice | null {
  if (notice === undefined) return null;
  noticeSeq += 1;
  return { ...notice, id: noticeSeq };
}

// localStorage can be missing or blocked (private mode, SSR); never let that break the app.
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      // Storage unavailable: keep working in memory.
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      // Storage unavailable: nothing to remove.
    }
  },
};

export const STORAGE_KEY = "monis-builder";

export const useSetupStore = create<SetupState>()(
  persist(
    (set, get) => {
      const apply = (result: SetupResult): void => {
        set({ setup: result.setup, notice: stamp(result.notice) });
      };
      return {
        setup: defaultSetup(),
        hydrated: false,
        activeCategory: "desk",
        notice: null,
        search: "",
        view: "room",
        lastOrder: null,
        previousSetup: null,
        hydrate: async () => {
          if (get().hydrated) return;
          const shared = decodeSetup(window.location.search);
          if (shared !== null) {
            window.history.replaceState(null, "", window.location.pathname);
            const notice =
              shared.dropped.length > 0
                ? {
                    message: "Some items in this link are no longer available.",
                  }
                : undefined;
            set({ setup: shared.setup, hydrated: true, notice: stamp(notice) });
            return;
          }
          await useSetupStore.persist.rehydrate();
          set({ hydrated: true });
        },
        applyPreset: (id) => {
          set({
            setup: { ...presetSetup(id), plan: get().setup.plan },
            notice: null,
          });
        },
        startEmpty: () => {
          set({
            setup: { ...emptySetup(), plan: get().setup.plan },
            notice: null,
          });
        },
        toggle: (id) => {
          apply(toggleItem(get().setup, id));
        },
        add: (id) => {
          apply(addItem(get().setup, id));
        },
        remove: (id) => {
          apply(removeItem(get().setup, id));
        },
        chooseDesk: (id) => {
          apply(setDesk(get().setup, id));
        },
        chooseChair: (id) => {
          apply(setChair(get().setup, id));
        },
        choosePlan: (plan) => {
          set({ setup: setPlan(get().setup, plan) });
        },
        choosePosture: (posture) => {
          apply(setPosture(get().setup, posture));
        },
        // Opening a category (tab or "+" hotspot) leaves search mode.
        showCategory: (category) => {
          set({ activeCategory: category, search: "" });
        },
        setSearch: (query) => {
          set({ search: query });
        },
        setView: (view) => {
          set({ view });
        },
        // Smart setup keeps the setup it replaced, for a one-step undo.
        applySuggestion: (next) => {
          set({
            previousSetup: get().setup,
            setup: next,
            notice: null,
            search: "",
          });
        },
        undoSuggestion: () => {
          const previous = get().previousSetup;
          if (previous !== null) set({ setup: previous, previousSetup: null });
        },
        placeOrder: (order) => {
          set({ lastOrder: order });
        },
        startNewSetup: () => {
          set({
            setup: defaultSetup(),
            view: "room",
            search: "",
            activeCategory: "desk",
            notice: null,
          });
        },
        // Tapping the desk, a screen or the chair in the scene.
        editFromScene: (category) => {
          set({ activeCategory: category, search: "", view: "desk" });
        },
      };
    },
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
      partialize: (state) => ({
        setup: state.setup,
        lastOrder: state.lastOrder,
      }),
      merge: (persisted, current) => {
        const stored = persisted as
          { setup?: unknown; lastOrder?: unknown } | undefined;
        const raw = parseSetup(stored?.setup);
        return {
          ...current,
          setup: raw === null ? current.setup : normalizeSetup(raw).setup,
          lastOrder: parseOrder(stored?.lastOrder),
        };
      },
      migrate: () => ({ setup: defaultSetup() }),
    },
  ),
);
