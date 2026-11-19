"use client";

import { useEffect, useState } from "react";

const IDLE_MS = 2400;

/**
 * Matrix-style caret after the brand: blinks when idle,
 * pauses while the user scrolls or interacts; quiet/static in basic theme.
 */
export function BrandWordmark({ children }: { children: string }) {
  const [paused, setPaused] = useState(false);
  const [theme, setTheme] = useState<"matrix" | "basic">("matrix");

  useEffect(() => {
    const readTheme = () => {
      const t = document.documentElement.getAttribute("data-theme");
      setTheme(t === "basic" ? "basic" : "matrix");
    };
    readTheme();
    const mo = new MutationObserver(readTheme);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    if (theme !== "matrix") {
      setPaused(true);
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    const onActivity = () => {
      setPaused(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setPaused(false), IDLE_MS);
    };

    const opts: AddEventListenerOptions = { passive: true };
    window.addEventListener("scroll", onActivity, opts);
    window.addEventListener("wheel", onActivity, opts);
    window.addEventListener("pointerdown", onActivity, opts);
    window.addEventListener("keydown", onActivity);
    window.addEventListener("touchmove", onActivity, opts);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("scroll", onActivity);
      window.removeEventListener("wheel", onActivity);
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("touchmove", onActivity);
    };
  }, [theme]);

  const className = [
    "brand-wordmark",
    theme === "basic" ? "is-basic" : "",
    paused ? "is-paused" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={className}>{children}</span>;
}
