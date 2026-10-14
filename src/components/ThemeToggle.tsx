"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      localStorage.setItem("tribo-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("tribo-theme", "light");
    }
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Alternar modo claro y oscuro"
      className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all hover:scale-105 active:scale-95 cursor-pointer"
      title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400 animate-fadeIn" />
      ) : (
        <Moon className="w-4 h-4 text-sky-600 animate-fadeIn" />
      )}
    </button>
  );
}
