"use client";

import { useEffect, useRef } from "react";
import { useWorkspace } from "@/lib/store";
import { Block, focusBlock } from "./Block";

interface BlockEditorProps {
  pageId: string;
}

export function BlockEditor({ pageId }: BlockEditorProps) {
  const page = useWorkspace((s) => s.pages[pageId]);
  const renamePage = useWorkspace((s) => s.renamePage);
  const insertBlockAfter = useWorkspace((s) => s.insertBlockAfter);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lastTitle = useRef("");

  const title = page?.title;

  useEffect(() => {
    if (titleRef.current && title !== undefined && title !== lastTitle.current) {
      titleRef.current.textContent = title === "Sans titre" ? "" : title;
      lastTitle.current = title;
    }
  }, [title]);

  if (!page) {
    return <p className="text-sm text-zinc-500">Cette page n&apos;existe pas.</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-6 py-16 sm:px-10">
      <h1
        ref={titleRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Sans titre"
        className="mb-6 text-4xl font-bold outline-none empty:before:text-zinc-300 empty:before:content-[attr(data-placeholder)] dark:empty:before:text-zinc-700"
        onInput={(e) => {
          const text = e.currentTarget.textContent ?? "";
          lastTitle.current = text;
          renamePage(pageId, text || "Sans titre");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            focusBlock(page.blockIds[0]);
          }
        }}
      />

      <div className="flex flex-col">
        {page.blockIds.map((blockId) => (
          <Block key={blockId} pageId={pageId} blockId={blockId} />
        ))}
        <div
          className="h-16 cursor-text"
          onClick={() => {
            const lastId = page.blockIds[page.blockIds.length - 1];
            const newId = insertBlockAfter(pageId, lastId);
            requestAnimationFrame(() => focusBlock(newId));
          }}
        />
      </div>
    </div>
  );
}
