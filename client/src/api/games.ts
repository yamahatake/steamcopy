import apiClient from "./client";

export interface GameScreenshot {
  id: string;
  thumbnailUrl: string;
  fullUrl: string;
  order: number;
}

export interface GameGenre {
  id: string;
  genre: string;
}

export interface GameTag {
  id: string;
  name: string;
}

export interface Game {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  description: string | null;
  price: string;
  originalPrice: string | null;
  developer: string | null;
  publisher: string | null;
  releaseDate: string | null;
  headerImage: string | null;
  capsuleImage: string | null;
  backgroundImage: string | null;
  isFree: boolean;
  isEarlyAccess: boolean;
  reviewScore: number | null;
  reviewCount: number | null;
  genres: GameGenre[];
  tags: GameTag[];
  screenshots: GameScreenshot[];
}

export interface GamesResponse {
  data: Game[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GameFilters {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
  minPrice?: number;
  maxPrice?: number;
  isFree?: boolean;
}

export const gamesApi = {
  list: async (filters: GameFilters = {}): Promise<GamesResponse> => {
    const res = await apiClient.get("/games", { params: filters });
    return res.data;
  },

  featured: async (): Promise<{ data: Game[] }> => {
    const res = await apiClient.get("/games/featured");
    return res.data;
  },

  getBySlug: async (slug: string): Promise<{ data: Game }> => {
    const res = await apiClient.get(`/games/${slug}`);
    return res.data;
  },

  getOwnership: async (slug: string): Promise<{ owned: boolean; wishlisted: boolean }> => {
    const res = await apiClient.get(`/games/${slug}/ownership`);
    return res.data;
  },
};
