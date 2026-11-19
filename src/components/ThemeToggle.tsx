"use client";

import { useEffect, useState } from "react";

type Theme = "matrix" | "basic";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("matrix");

  useEffect(() => {
    const stored = window.localStorage.getItem("nexus-theme");
    const next: Theme = stored === "basic" ? "basic" : "matrix";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  function toggle() {
    const next: Theme = theme === "matrix" ? "basic" : "matrix";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem("nexus-theme", next);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label="Toggle theme"
    >
      theme:{theme}
    </button>
  );
}
