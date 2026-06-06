// =============================================================================
// createEntityStore — factory that turns a static mock array into a dynamic,
// in-memory Zustand store. Each store exposes:
//   items, add, update, remove, getById, reset
// Data is seeded from the static mock data and stays editable for the session
// (a full refresh resets to seed — there's no database yet). To persist across
// refreshes, wrap the initializer below in zustand's `persist` middleware.
// =============================================================================
import { create } from "zustand";

export function createEntityStore(seed, { idPrefix = "REC" } = {}) {
  return create((set, get) => ({
    items: seed,

    add: (item) => {
      const id =
        item.id ||
        `${idPrefix}-${String(get().items.length + 1).padStart(3, "0")}`;
      const record = { id, ...item };
      set((state) => ({ items: [record, ...state.items] }));
      return record;
    },

    update: (id, patch) =>
      set((state) => ({
        items: state.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      })),

    remove: (id) =>
      set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

    getById: (id) => get().items.find((i) => i.id === id) || null,

    reset: () => set({ items: seed }),
  }));
}

export default createEntityStore;
