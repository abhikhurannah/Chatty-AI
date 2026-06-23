import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppTheme =
  | "default"
  | "midnight"
  | "sunset"
  | "ocean"
  | "forest"
  | "candy"
  | "neon"
  | "autumn"
  | "mocha";

interface ThemeStore {
  appTheme: AppTheme;
  setAppTheme: (theme: AppTheme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      appTheme: "default",
      setAppTheme: (appTheme) => {
        // Remove all theme classes then add the new one
        const root = document.documentElement;
        const themeClasses = [
          "theme-midnight",
          "theme-sunset",
          "theme-ocean",
          "theme-forest",
          "theme-candy",
          "theme-neon",
          "theme-autumn",
          "theme-mocha",
        ];
        root.classList.remove(...themeClasses);
        if (appTheme !== "default") {
          root.classList.add(`theme-${appTheme}`);
        }
        set({ appTheme });
      },
    }),
    {
      name: "chatty-app-theme",
    }
  )
);