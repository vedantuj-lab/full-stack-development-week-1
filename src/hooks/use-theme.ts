import { useCallback, useEffect, useState } from "react";

export type Theme = "dark" | "light";
const KEY = "tasktide-theme";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    setThemeState(localStorage.getItem(KEY) === "light" ? "light" : "dark");
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* storage unavailable */
    }
  }, []);

  return { theme, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") };
}
