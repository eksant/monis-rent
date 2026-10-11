import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

import { defaultSetup, emptySetup, presetSetup } from "@/data/presets";
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

export interface SetupState {
  setup: Setup;
  hydrated: boolean;
  activeCategory: CategoryId;
  notice: StoreNotice | null;
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
        showCategory: (category) => {
          set({ activeCategory: category });
        },
      };
    },
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
      partialize: (state) => ({ setup: state.setup }),
      merge: (persisted, current) => {
        const raw = parseSetup(
          (persisted as { setup?: unknown } | undefined)?.setup,
        );
        return raw === null
          ? current
          : { ...current, setup: normalizeSetup(raw).setup };
      },
      migrate: () => ({ setup: defaultSetup() }),
    },
  ),
);
