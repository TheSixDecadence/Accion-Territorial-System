import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuth = create(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isSessionVerified: false,

      setAccessToken: (accessToken) => set({ accessToken }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setUser: (user) => set({ user }),
      setSessionVerified: (isSessionVerified) => set({ isSessionVerified }),
      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isSessionVerified: true,
        }),
    }),
    {
      name: "__ACCION_TERRITORIAL_AUTH__",
      partialize: ({ accessToken, refreshToken }) => ({
        accessToken,
        refreshToken,
      }),
    },
  ),
);
