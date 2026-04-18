import apiClient from "./client";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  balance: string;
  role: "user" | "admin";
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const authApi = {
  register: async (data: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }): Promise<AuthResponse> => {
    const res = await apiClient.post("/auth/register", data);
    return res.data;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await apiClient.post("/auth/login", data);
    return res.data;
  },

  me: async (): Promise<{ user: AuthUser }> => {
    const res = await apiClient.get("/auth/me");
    return res.data;
  },
};
