"use client";

import { useMemo } from "react";
import Link from "next/link";
import { getAllTodos, useWorkspace } from "@/lib/store";
import { formatShortDate, todayISO } from "@/lib/date";

export default function TasksPage() {
  const pages = useWorkspace((s) => s.pages);
  const blocks = useWorkspace((s) => s.blocks);
  const toggleTodo = useWorkspace((s) => s.toggleTodo);
  const setBlockDueDate = useWorkspace((s) => s.setBlockDueDate);

  const todos = useMemo(() => getAllTodos(pages, blocks), [pages, blocks]);
  const today = todayISO();

  const pending = todos
    .filter((t) => !t.block.checked)
    .sort((a, b) => {
      if (a.block.dueDate && b.block.dueDate) return a.block.dueDate.localeCompare(b.block.dueDate);
      if (a.block.dueDate) return -1;
      if (b.block.dueDate) return 1;
      return 0;
    });
  const done = todos.filter((t) => t.block.checked);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-6 py-16 sm:px-10">
      <h1 className="mb-8 text-4xl font-bold">Tâches</h1>

      {todos.length === 0 && (
        <p className="text-sm text-zinc-500">
          Aucune case à cocher pour l&apos;instant. Tapez « / » dans une page pour en ajouter une.
        </p>
      )}

      {pending.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
            À faire ({pending.length})
          </h2>
          <div className="flex flex-col">
            {pending.map(({ block, pageId, pageTitle }) => (
              <div key={block.id} className="group flex items-center gap-2 py-1.5">
                <input
                  type="checkbox"
                  checked={!!block.checked}
                  onChange={() => toggleTodo(block.id)}
                  className="h-3.5 w-3.5 shrink-0"
                />
                <span className="min-w-0 flex-1 truncate text-sm">{block.content || "Sans titre"}</span>
                <input
                  type="date"
                  defaultValue={block.dueDate ?? ""}
                  onChange={(e) => setBlockDueDate(block.id, e.currentTarget.value || null)}
                  className={`hidden shrink-0 rounded border border-transparent bg-transparent text-xs group-hover:block ${
                    block.dueDate && block.dueDate < today ? "text-red-500" : "text-zinc-400"
                  }`}
                />
                {block.dueDate && (
                  <span
                    className={`shrink-0 text-xs group-hover:hidden ${
                      block.dueDate < today ? "text-red-500" : "text-zinc-400"
                    }`}
                  >
                    {formatShortDate(block.dueDate)}
                  </span>
                )}
                <Link
                  href={`/workspace/${pageId}`}
                  className="max-w-24 shrink-0 truncate text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  {pageTitle}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {done.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
            Terminé ({done.length})
          </h2>
          <div className="flex flex-col">
            {done.map(({ block, pageId, pageTitle }) => (
              <div key={block.id} className="group flex items-center gap-2 py-1.5">
                <input
                  type="checkbox"
                  checked={!!block.checked}
                  onChange={() => toggleTodo(block.id)}
                  className="h-3.5 w-3.5 shrink-0"
                />
                <span className="min-w-0 flex-1 truncate text-sm text-zinc-400 line-through">
                  {block.content || "Sans titre"}
                </span>
                <Link
                  href={`/workspace/${pageId}`}
                  className="max-w-24 shrink-0 truncate text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  {pageTitle}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
