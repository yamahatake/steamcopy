import { create } from "zustand";
import type { CartItem } from "../api/cart";

interface CartState {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (gameId: string) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],

  setItems: (items) => set({ items }),

  addItem: (item) =>
    set((state) => ({
      items: state.items.some((i) => i.gameId === item.gameId)
        ? state.items
        : [...state.items, item],
    })),

  removeItem: (gameId) =>
    set((state) => ({ items: state.items.filter((i) => i.gameId !== gameId) })),

  clear: () => set({ items: [] }),

  total: () =>
    get().items.reduce((sum, item) => sum + parseFloat(item.game.price), 0),

  count: () => get().items.length,
}));
