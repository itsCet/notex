"use client";

import { useEffect, useRef, useState } from "react";
import { useWorkspace } from "@/lib/store";
import type { BlockType } from "@/lib/types";
import { isCaretAtEnd, isCaretAtStart, placeCaretAtEnd, placeCaretAtStart } from "@/lib/caret";
import { formatShortDate } from "@/lib/date";
import { SlashMenu } from "./SlashMenu";

function blockElementId(id: string) {
  return `block-${id}`;
}

export function focusBlock(id: string, atStart = false) {
  const el = document.getElementById(blockElementId(id));
  if (!el) return;
  if (atStart) placeCaretAtStart(el);
  else placeCaretAtEnd(el);
}

const HEADING_CLASS: Record<string, string> = {
  heading1: "text-3xl font-semibold",
  heading2: "text-2xl font-semibold",
  heading3: "text-xl font-semibold",
};

interface BlockProps {
  pageId: string;
  blockId: string;
}

export function Block({ pageId, blockId }: BlockProps) {
  const block = useWorkspace((s) => s.blocks[blockId]);
  const page = useWorkspace((s) => s.pages[pageId]);
  const updateBlockContent = useWorkspace((s) => s.updateBlockContent);
  const setBlockType = useWorkspace((s) => s.setBlockType);
  const setBlockDueDate = useWorkspace((s) => s.setBlockDueDate);
  const toggleTodo = useWorkspace((s) => s.toggleTodo);
  const insertBlockAfter = useWorkspace((s) => s.insertBlockAfter);
  const deleteBlock = useWorkspace((s) => s.deleteBlock);

  const ref = useRef<HTMLDivElement>(null);
  const lastContent = useRef("");
  const [slashActive, setSlashActive] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [editingDate, setEditingDate] = useState(false);

  const content = block?.content;

  useEffect(() => {
    if (ref.current && content !== undefined && content !== lastContent.current) {
      ref.current.textContent = content;
      lastContent.current = content;
    }
  }, [content]);

  if (!block) return null;

  const index = page.blockIds.indexOf(blockId);
  const prevId = index > 0 ? page.blockIds[index - 1] : null;
  const nextId = index < page.blockIds.length - 1 ? page.blockIds[index + 1] : null;

  function handleInput(e: React.FormEvent<HTMLDivElement>) {
    const text = e.currentTarget.textContent ?? "";
    lastContent.current = text;
    updateBlockContent(blockId, text);

    if (text.startsWith("/")) {
      setSlashActive(true);
      setSlashQuery(text.slice(1));
    } else {
      setSlashActive(false);
    }
  }

  function applyBlockType(type: BlockType) {
    setBlockType(blockId, type);
    updateBlockContent(blockId, "");
    if (ref.current) {
      ref.current.textContent = "";
      lastContent.current = "";
    }
    setSlashActive(false);
    requestAnimationFrame(() => focusBlock(blockId));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (slashActive && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === "Escape")) {
      return; // handled by SlashMenu
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const newId = insertBlockAfter(pageId, blockId, block.type === "todo" ? "todo" : "paragraph");
      requestAnimationFrame(() => focusBlock(newId));
    } else if (e.key === "Backspace") {
      const el = ref.current;
      if (el && block.content === "" && prevId) {
        e.preventDefault();
        deleteBlock(pageId, blockId);
        requestAnimationFrame(() => focusBlock(prevId));
      } else if (el && isCaretAtStart(el) && prevId) {
        // keep default merge behavior out of scope for v1; just move caret to previous block start
        e.preventDefault();
        focusBlock(prevId);
      }
    } else if (e.key === "ArrowUp") {
      const el = ref.current;
      if (el && isCaretAtStart(el) && prevId) {
        e.preventDefault();
        focusBlock(prevId);
      }
    } else if (e.key === "ArrowDown") {
      const el = ref.current;
      if (el && isCaretAtEnd(el) && nextId) {
        e.preventDefault();
        focusBlock(nextId);
      }
    }
  }

  const commonProps = {
    id: blockElementId(blockId),
    ref,
    contentEditable: true,
    suppressContentEditableWarning: true,
    onInput: handleInput,
    onKeyDown: handleKeyDown,
    className: "flex-1 outline-none",
  };

  if (block.type === "divider") {
    return <hr className="my-3 border-black/10 dark:border-white/10" />;
  }

  if (block.type === "todo") {
    return (
      <div className="group relative flex items-start gap-2 py-0.5">
        <input
          type="checkbox"
          checked={!!block.checked}
          onChange={() => toggleTodo(blockId)}
          className="mt-1.5 h-3.5 w-3.5"
        />
        <div
          {...commonProps}
          data-placeholder="Liste de tâches"
          className={`flex-1 outline-none empty:before:text-zinc-400 empty:before:content-[attr(data-placeholder)] ${
            block.checked ? "text-zinc-400 line-through" : ""
          }`}
        />
        {editingDate ? (
          <input
            type="date"
            autoFocus
            defaultValue={block.dueDate ?? ""}
            onBlur={(e) => {
              setBlockDueDate(blockId, e.currentTarget.value || null);
              setEditingDate(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") setEditingDate(false);
            }}
            className="rounded border border-black/10 bg-transparent px-1 text-xs text-zinc-500 dark:border-white/10"
          />
        ) : block.dueDate ? (
          <button
            type="button"
            onClick={() => setEditingDate(true)}
            className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            {formatShortDate(block.dueDate)}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setEditingDate(true)}
            className="hidden shrink-0 rounded-full px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-100 group-hover:block dark:hover:bg-zinc-800"
          >
            + date
          </button>
        )}
        {slashActive && (
          <SlashMenu key={slashQuery} query={slashQuery} onSelect={applyBlockType} onClose={() => setSlashActive(false)} />
        )}
      </div>
    );
  }

  const wrapperByType: Partial<Record<string, string>> = {
    bulleted: "before:content-['•'] before:mr-2 before:text-zinc-400",
    numbered: "before:content-['·'] before:mr-2 before:text-zinc-400",
    quote: "border-l-2 border-zinc-300 pl-3 italic text-zinc-600 dark:border-zinc-600 dark:text-zinc-400",
  };

  return (
    <div className="group relative flex items-start py-0.5">
      <div
        {...commonProps}
        data-placeholder={index === 0 ? "Sans titre pour l'instant..." : ""}
        className={`flex-1 whitespace-pre-wrap outline-none empty:before:text-zinc-400 empty:before:content-[attr(data-placeholder)] ${
          HEADING_CLASS[block.type] ?? ""
        } ${wrapperByType[block.type] ?? ""}`}
      />
      {slashActive && (
        <SlashMenu key={slashQuery} query={slashQuery} onSelect={applyBlockType} onClose={() => setSlashActive(false)} />
      )}
    </div>
  );
}
