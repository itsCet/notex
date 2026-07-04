"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllTodos, getJournalPage, useWorkspace } from "@/lib/store";
import {
  formatMonthLabel,
  getMonthGrid,
  getWeekdayLabels,
  isSameMonth,
  todayISO,
} from "@/lib/date";

export default function CalendarPage() {
  const router = useRouter();
  const pages = useWorkspace((s) => s.pages);
  const blocks = useWorkspace((s) => s.blocks);
  const getOrCreateJournalPage = useWorkspace((s) => s.getOrCreateJournalPage);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const today = todayISO();
  const days = useMemo(() => getMonthGrid(year, month), [year, month]);
  const todos = useMemo(() => getAllTodos(pages, blocks), [pages, blocks]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, typeof todos>();
    for (const entry of todos) {
      if (!entry.block.dueDate) continue;
      const list = map.get(entry.block.dueDate) ?? [];
      list.push(entry);
      map.set(entry.block.dueDate, list);
    }
    return map;
  }, [todos]);

  function goToDay(iso: string) {
    const existing = getJournalPage(pages, iso);
    const id = existing ? existing.id : getOrCreateJournalPage(iso);
    router.push(`/workspace/${id}`);
  }

  function changeMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-6 py-16 sm:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold sm:text-4xl">Calendrier</h1>
        <div className="flex items-center gap-2 text-sm sm:gap-3">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="rounded px-2 py-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            ‹
          </button>
          <span className="w-28 text-center font-medium sm:w-36">{formatMonthLabel(year, month)}</span>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="rounded px-2 py-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            ›
          </button>
          <button
            type="button"
            onClick={() => {
              setYear(now.getFullYear());
              setMonth(now.getMonth());
            }}
            className="rounded-full border border-black/10 px-3 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-zinc-900"
          >
            Aujourd&apos;hui
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-black/[.06] bg-black/[.06] dark:border-white/[.08] dark:bg-white/[.08]">
        {getWeekdayLabels().map((label) => (
          <div
            key={label}
            className="bg-zinc-50 px-2 py-1.5 text-center text-xs font-medium text-zinc-500 dark:bg-zinc-950"
          >
            {label}
          </div>
        ))}
        {days.map((iso) => {
          const journalPage = getJournalPage(pages, iso);
          const dayTasks = tasksByDate.get(iso) ?? [];
          const inMonth = isSameMonth(iso, year, month);
          const isToday = iso === today;
          const dayNumber = Number(iso.split("-")[2]);

          return (
            <button
              key={iso}
              type="button"
              onClick={() => goToDay(iso)}
              className={`flex min-h-24 flex-col items-start gap-1 bg-white p-1.5 text-left align-top dark:bg-black ${
                inMonth ? "" : "opacity-40"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                  isToday ? "bg-black text-white dark:bg-white dark:text-black" : "text-zinc-500"
                }`}
              >
                {dayNumber}
              </span>
              {journalPage && (
                <span className="w-full truncate text-xs text-zinc-500">{journalPage.title}</span>
              )}
              {dayTasks.slice(0, 2).map(({ block }) => (
                <span
                  key={block.id}
                  className={`w-full truncate text-xs ${
                    block.checked ? "text-zinc-300 line-through" : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {block.content || "Sans titre"}
                </span>
              ))}
              {dayTasks.length > 2 && (
                <span className="text-xs text-zinc-400">+{dayTasks.length - 2}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
