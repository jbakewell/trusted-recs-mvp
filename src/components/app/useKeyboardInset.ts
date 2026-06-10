"use client";

import { useEffect } from "react";

export function useKeyboardInset() {
  useEffect(() => {
    const visualViewport = window.visualViewport;

    if (!visualViewport) {
      return;
    }

    const viewport: VisualViewport = visualViewport;

    function updateKeyboardInset() {
      const keyboardInset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      document.documentElement.style.setProperty("--keyboard-inset", `${keyboardInset}px`);
    }

    viewport.addEventListener("resize", updateKeyboardInset);
    viewport.addEventListener("scroll", updateKeyboardInset);
    updateKeyboardInset();

    return () => {
      viewport.removeEventListener("resize", updateKeyboardInset);
      viewport.removeEventListener("scroll", updateKeyboardInset);
      document.documentElement.style.removeProperty("--keyboard-inset");
    };
  }, []);
}
