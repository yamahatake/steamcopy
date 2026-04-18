import apiClient from "./client";
import type { Game } from "./games";

export interface CartItem {
  id: string;
  gameId: string;
  addedAt: string;
  game: Game;
}

export const cartApi = {
  get: async (): Promise<{ data: CartItem[] }> => {
    const res = await apiClient.get("/cart");
    return res.data;
  },

  add: async (gameId: string): Promise<{ message: string }> => {
    const res = await apiClient.post(`/cart/${gameId}`);
    return res.data;
  },

  remove: async (gameId: string): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/cart/${gameId}`);
    return res.data;
  },

  checkout: async (): Promise<{ message: string; itemCount: number; total: number }> => {
    const res = await apiClient.post("/cart/checkout");
    return res.data;
  },
};

export const usersApi = {
  library: async () => {
    const res = await apiClient.get("/users/library");
    return res.data;
  },

  wishlist: async () => {
    const res = await apiClient.get("/users/wishlist");
    return res.data;
  },

  addToWishlist: async (gameId: string) => {
    const res = await apiClient.post(`/users/wishlist/${gameId}`);
    return res.data;
  },

  removeFromWishlist: async (gameId: string) => {
    const res = await apiClient.delete(`/users/wishlist/${gameId}`);
    return res.data;
  },

  updateProfile: async (data: {
    displayName?: string;
    bio?: string;
    country?: string;
    avatarUrl?: string;
  }) => {
    const res = await apiClient.patch("/users/profile", data);
    return res.data;
  },
};
