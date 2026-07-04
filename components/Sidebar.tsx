"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getChildPages, useWorkspace } from "@/lib/store";
import type { Page } from "@/lib/types";

function PageRow({ page, depth }: { page: Page; depth: number }) {
  const router = useRouter();
  const params = useParams<{ pageId?: string }>();
  const isActive = params?.pageId === page.id;
  const pages = useWorkspace((s) => s.pages);
  const children = useMemo(() => getChildPages(pages, page.id), [pages, page.id]);
  const createPage = useWorkspace((s) => s.createPage);
  const deletePage = useWorkspace((s) => s.deletePage);

  return (
    <div>
      <div
        className={`group flex items-center justify-between rounded-md px-2 py-1 text-sm ${
          isActive ? "bg-zinc-200 dark:bg-zinc-800" : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
        }`}
        style={{ paddingLeft: 8 + depth * 14 }}
      >
        <Link href={`/workspace/${page.id}`} className="flex-1 truncate">
          {page.title || "Sans titre"}
        </Link>
        <div className="hidden items-center gap-1 group-hover:flex">
          <button
            type="button"
            title="Ajouter une sous-page"
            className="rounded px-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            onClick={(e) => {
              e.preventDefault();
              const id = createPage(page.id);
              router.push(`/workspace/${id}`);
            }}
          >
            +
          </button>
          <button
            type="button"
            title="Supprimer"
            className="rounded px-1 text-zinc-400 hover:text-red-600"
            onClick={(e) => {
              e.preventDefault();
              deletePage(page.id);
              if (isActive) router.push("/workspace");
            }}
          >
            ×
          </button>
        </div>
      </div>
      {children.length > 0 && (
        <div>
          {children.map((child) => (
            <PageRow key={child.id} page={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const router = useRouter();
  const pages = useWorkspace((s) => s.pages);
  const rootPages = useMemo(() => getChildPages(pages, null), [pages]);
  const createPage = useWorkspace((s) => s.createPage);

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-black/[.06] bg-zinc-50/60 dark:border-white/[.08] dark:bg-zinc-950">
      <div className="flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight text-zinc-700 dark:text-zinc-200">
          Notex
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-2">
        {rootPages.map((page) => (
          <PageRow key={page.id} page={page} depth={0} />
        ))}
      </nav>
      <div className="p-2">
        <button
          type="button"
          className="w-full rounded-md px-2 py-1.5 text-left text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          onClick={() => {
            const id = createPage(null);
            router.push(`/workspace/${id}`);
          }}
        >
          + Nouvelle page
        </button>
      </div>
    </aside>
  );
}
