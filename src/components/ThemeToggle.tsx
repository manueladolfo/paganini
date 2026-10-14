"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("tribo-theme");
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(stored);
        return;
      }
    } catch (_) {}

    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(nextTheme);
    try {
      localStorage.setItem("tribo-theme", nextTheme);
    } catch (_) {}
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
