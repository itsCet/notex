"use client";

import { useEffect, useState } from "react";
import { BLOCK_TYPE_OPTIONS, type BlockType } from "@/lib/types";

interface SlashMenuProps {
  query: string;
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

export function SlashMenu({ query, onSelect, onClose }: SlashMenuProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const options = BLOCK_TYPE_OPTIONS.filter((opt) => {
    const q = query.toLowerCase();
    return q === "" || opt.label.toLowerCase().includes(q) || opt.keywords.some((k) => k.includes(q));
  });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (options[activeIndex]) onSelect(options[activeIndex].type);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [activeIndex, options, onSelect, onClose]);

  if (options.length === 0) return null;

  return (
    <div className="absolute z-10 mt-1 w-56 overflow-hidden rounded-lg border border-black/[.08] bg-white py-1 shadow-lg dark:border-white/[.1] dark:bg-zinc-900">
      {options.map((opt, i) => (
        <button
          key={opt.type}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(opt.type);
          }}
          className={`block w-full px-3 py-1.5 text-left text-sm ${
            i === activeIndex
              ? "bg-zinc-100 dark:bg-zinc-800"
              : "text-zinc-700 dark:text-zinc-300"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
