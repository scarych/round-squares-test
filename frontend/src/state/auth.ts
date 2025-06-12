import { create } from "zustand";
import { persist, devtools, createJSONStorage } from "zustand/middleware";

interface IAuthTokens {
  token?: string;
  resetToken: () => void;
  setToken: (token: string) => void;
}

export const useAuthTokens = create<IAuthTokens>()(
  devtools(
    persist(
      (set) => ({
        resetToken() {
          set((state) => ({
            ...state,
            token: undefined,
          }));
        },
        setToken(token: string) {
          set((state) => ({
            ...state,
            token,
          }));
        },
      }),
      {
        name: "auth-storage", //
        // храним в рамках текущей сессии, чтобы каждое новое окно/вкладка требовало своей авторизации
        // и гасило тем самым предыдущий токен
        storage: createJSONStorage(() => sessionStorage), 
      }
    )
  )
);
