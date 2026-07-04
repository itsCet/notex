"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getChildPages, useWorkspace } from "@/lib/store";

export default function WorkspaceIndexPage() {
  const router = useRouter();
  const pages = useWorkspace((s) => s.pages);
  const rootPages = useMemo(() => getChildPages(pages, null), [pages]);
  const createPage = useWorkspace((s) => s.createPage);

  useEffect(() => {
    if (rootPages.length > 0) {
      router.replace(`/workspace/${rootPages[0].id}`);
    }
  }, [rootPages, router]);

  if (rootPages.length > 0) return null;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
        Votre espace est vide
      </h1>
      <p className="max-w-sm text-sm text-zinc-500">
        Créez votre première page pour commencer à écrire.
      </p>
      <button
        type="button"
        className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        onClick={() => {
          const id = createPage(null);
          router.push(`/workspace/${id}`);
        }}
      >
        Créer une page
      </button>
    </div>
  );
}
