import { useState, useEffect } from "react";

export function useTheme(gameKey: string): ["dark" | "light", () => void] {
  const storageKey = `${gameKey}_theme`;

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem(storageKey) as "dark" | "light") || "dark";
  });

  useEffect(() => {
    document.body.classList.toggle("light-palette", theme === "light");
    document.body.classList.toggle("dark-palette", theme === "dark");
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  return [theme, toggleTheme];
}
